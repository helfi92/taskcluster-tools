import React from 'react';
import moment from 'moment';
import {
  Table,
  Button,
  ButtonToolbar,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import Icon from 'react-fontawesome';
import { request, fromNow } from 'taskcluster-client-web';
import HelmetTitle from '../../components/HelmetTitle';
import Breadcrumb from '../../components/Breadcrumb';
import Snackbar from '../../components/Snackbar';
import Error from '../../components/Error';
import Spinner from '../../components/Spinner';
import SearchForm from './SearchForm';
import WorkerTable from './WorkerTable';
import styles from './styles.css';

export default class WorkerManager extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      provisioners: [],
      workerTypes: [],
      recentTasks: [],
      worker: null,
      error: null,
      loading: false,
      actionLoading: false
    };
  }

  componentWillMount() {
    const { provisionerId, workerType, workerGroup, workerId } = this.props;

    if (provisionerId && workerType && workerGroup && workerId) {
      this.loadWorker(provisionerId, workerType, workerGroup, workerId);
    }

    if (provisionerId) {
      this.loadWorkerTypes(provisionerId);
    }

    this.loadProvisioners();
  }

  async loadProvisioners(token) {
    try {
      const {
        provisioners,
        continuationToken
      } = await this.props.queue.listProvisioners(
        token ? { continuationToken: token, limit: 100 } : { limit: 100 }
      );

      this.setState({
        provisioners: this.state.provisioners
          ? this.state.provisioners.concat(provisioners)
          : provisioners
      });

      if (continuationToken) {
        this.loadProvisioners(continuationToken);
      }
    } catch (error) {
      this.setState({
        provisioners: [],
        error
      });
    }
  }

  loadWorkerTypes = async (provisionerId, token) => {
    try {
      const {
        workerTypes,
        continuationToken
      } = await this.props.queue.listWorkerTypes(
        provisionerId,
        token ? { continuationToken: token, limit: 100 } : { limit: 100 }
      );

      this.setState({
        workerTypes:
          this.state.workerTypes && this.props.provisionerId === provisionerId
            ? this.state.workerTypes.concat(workerTypes)
            : workerTypes
      });

      if (continuationToken) {
        this.loadWorkerTypes(provisionerId, continuationToken);
      }
    } catch (error) {
      this.setState({
        workerTypes: [],
        error
      });
    }
  };

  loadWorker = async (provisionerId, workerType, workerGroup, workerId) => {
    this.setState({ worker: null, loading: true, error: null }, async () => {
      try {
        const worker = await this.props.queue.getWorker(
          provisionerId,
          workerType,
          workerGroup,
          workerId
        );
        const recentTasks = await this.loadRecentTasks(worker.recentTasks);

        this.setState({ worker, recentTasks, loading: false, error: null });
      } catch (error) {
        this.setState({ worker: null, recentTasks: [], loading: false, error });
      }
    });
  };

  loadRecentTasks = recentTasks =>
    Promise.all(
      recentTasks.map(async ({ taskId, runId }) => {
        const [task, { status }] = await Promise.all([
          this.props.queue.task(taskId),
          this.props.queue.status(taskId)
        ]);

        return { task, status, runId };
      })
    );

  updateURI = (provisionerId, workerType, workerGroup, workerId) => {
    const url = `/provisioners/${provisionerId}/worker-types/${workerType}/workers/${workerGroup}/${workerId}`;

    this.props.history.push(url);
  };

  toggleWorkerStatus = async () => {
    const {
      provisionerId,
      workerType,
      workerGroup,
      workerId,
      quarantineUntil
    } = this.state.worker;

    try {
      const worker = await this.props.queue.quarantineWorker(
        provisionerId,
        workerType,
        workerGroup,
        workerId,
        {
          quarantineUntil: quarantineUntil ? null : fromNow('7 days')
        }
      );

      this.setState({ worker });
    } catch (error) {
      this.setState({ error });
    }
  };

  handleActionClick(action) {
    const url = action.url
      .replace('<provisionerId>', this.state.worker.provisionerId)
      .replace('<workerType>', this.state.worker.workerType)
      .replace('<workerGroup>', this.state.worker.workerGroup)
      .replace('<workerId>', this.state.worker.workerId);

    this.setState({ actionLoading: true }, async () => {
      try {
        const credentials = await this.props.userSession.getCredentials();

        await request(url, {
          extra: this.props.queue.buildExtraData(credentials),
          credentials,
          method: action.method
        });

        this.notification.show(
          <span>
            {action.title}&nbsp;&nbsp;<Icon name="check" />
          </span>
        );
        this.setState({ actionLoading: false });
      } catch (error) {
        this.setState({ error, actionLoading: false });
      }
    });
  }

  render() {
    const {
      provisioners,
      workerTypes,
      worker,
      recentTasks,
      loading,
      error,
      actionLoading
    } = this.state;
    const { provisionerId, workerType, workerGroup, workerId } = this.props;
    const quarantineTooltip = (
      <Tooltip id="tooltip">
        {worker && worker.quarantineUntil
          ? 'Enabling a worker will resume accepting jobs.'
          : 'Quarantining a worker allows the machine to remain alive but not accept jobs for 7 days.'}
      </Tooltip>
    );
    const isQuarantined =
      worker &&
      new Date(worker.quarantineUntil).getTime() > new Date().getTime();
    const firstClaim = worker && moment(worker.firstClaim);
    const navList = [
      {
        title: provisionerId,
        href: `/provisioners/${provisionerId}`
      },
      {
        title: 'worker-types',
        href: `/provisioners/${provisionerId}/worker-types`
      },
      {
        title: workerType,
        href: `/provisioners/${provisionerId}/worker-types/${workerType}`
      },
      {
        title: workerGroup
      },
      {
        title: workerId
      }
    ];

    return (
      <div>
        <div key="header">
          <HelmetTitle title="Worker Explorer" />
          <h4>Worker Explorer</h4>
        </div>
        <Snackbar
          ref={child => {
            this.notification = child;
          }}
        />
        <Breadcrumb navList={navList} active={[workerGroup, workerId]} />
        <SearchForm
          key="input-form"
          provisioners={provisioners}
          workerTypes={workerTypes}
          provisionerId={provisionerId}
          workerType={workerType}
          workerGroup={workerGroup}
          workerId={workerId}
          updateURI={this.updateURI}
          loadWorker={this.loadWorker}
          loadWorkerTypes={this.loadWorkerTypes}
        />
        {error && <Error key="error" error={error} />}
        {loading && <Spinner key="spinner" />}
        {worker && (
          <div>
            <Table className={styles.metadataTable} condensed responsive>
              <tbody>
                <tr>
                  <td>First Claim</td>
                  <td>
                    {firstClaim.isAfter('2000-01-01')
                      ? firstClaim.fromNow()
                      : '-'}
                  </td>
                </tr>
                <tr>
                  <td style={{ verticalAlign: 'inherit' }}>Actions</td>
                  <td>
                    <ButtonToolbar>
                      <OverlayTrigger
                        delay={600}
                        placement="bottom"
                        overlay={quarantineTooltip}>
                        <Button
                          onClick={this.toggleWorkerStatus}
                          className={styles.actionButton}
                          bsSize="small"
                          bsStyle="warning">
                          {isQuarantined ? 'Enable' : 'Quarantine'}
                        </Button>
                      </OverlayTrigger>
                      {worker.actions.map((action, key) => (
                        <OverlayTrigger
                          key={`worker-action-${key}`}
                          delay={600}
                          placement="bottom"
                          overlay={
                            <Tooltip id={`action-tooltip-${key}`}>
                              {action.description}
                            </Tooltip>
                          }>
                          <Button
                            className={styles.actionButton}
                            bsSize="small"
                            disabled={actionLoading}
                            onClick={() => this.handleActionClick(action)}>
                            {action.title}
                          </Button>
                        </OverlayTrigger>
                      ))}
                    </ButtonToolbar>
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        )}
        {actionLoading && <Spinner />}
        {worker && <WorkerTable tasks={recentTasks} />}
      </div>
    );
  }
}
