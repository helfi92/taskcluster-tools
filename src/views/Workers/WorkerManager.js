import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Breadcrumb, Button, ButtonGroup, Glyphicon, DropdownButton, MenuItem, Label } from 'react-bootstrap';
import HelmetTitle from '../../components/HelmetTitle';
import Error from '../../components/Error';
import Spinner from '../../components/Spinner';
import DateView from '../../components/DateView';
import styles from './styles.css';

export default class WorkerManager extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      workers: null,
      workerToken: null,
      error: null,
      filter: 'None'
    };
  }

  componentWillMount() {
    this.loadWorkers(this.props);
  }

  componentDidUpdate(prevProps, { workerToken, filter }) {
    const filterChanged = filter !== this.state.filter;

    if (workerToken !== this.state.workerToken || filterChanged) {
      this.setState({
        loading: true,
        ...(filterChanged ? { workers: null } : {})
      }, () => this.loadWorkers(this.props));
    }
  }

  loadStatus = async (taskId) => {
    if (!taskId) {
      return {};
    }

    const { status } = await this.props.queue.status(taskId);

    const runs = status.runs.length - 1;
    const lastClaimStarted = status.runs[runs].started;
    const lastClaimResolved = status.runs[runs].resolved;

    return { lastClaimStarted, lastClaimResolved };
  };

  async loadWorkers({ provisionerId, workerType }) {
    try {
      const workers = await this.props.queue.listWorkers(provisionerId, workerType, {
        ...(this.state.workerToken ? { continuationToken: this.state.workerToken } : {}),
        ...{ limit: 15 },
        ...(this.state.filter.includes('disabled') ? { disabled: true } : {})
      });

      workers.workers = await Promise.all(
        workers.workers.map(async worker => ({ ...worker, ...(await this.loadStatus(worker.latestTask)) }))
      );

      this.setState({ workers, loading: false, error: null });
    } catch (error) {
      this.setState({ workers: null, loading: false, error });
    }
  }

  clearWorkerToken = () => !this.state.loading && this.setState({ workerToken: null });

  nextWorkers = () => !this.state.loading && this.setState({ workerToken: this.state.workers.continuationToken });

  onFilterSelect = filter => this.setState({ filter: filter.includes('disabled') ? 'disabled' : filter });

  render() {
    const { filter, workers, workerToken, loading, error } = this.state;

    return (
      <div>
        <div key="header">
          <HelmetTitle title="Workers" />
          <h4>Workers Explorer</h4>
        </div>
        <div>
          <Breadcrumb>
            <Breadcrumb.Item href={`/workers/provisioners/${this.props.provisionerId}`}>
              {this.props.provisionerId}
            </Breadcrumb.Item>
            <Breadcrumb.Item active>
              {this.props.workerType}
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className={styles.filters}>
          <DropdownButton
            id="workers-dropdown"
            bsSize="small"
            title={`Filter by: ${filter || 'None'}`}
            onSelect={this.onFilterSelect}>
            <MenuItem eventKey="None">None</MenuItem>
            <MenuItem divider />
            {['Status: disabled'].map((property, key) => (
              <MenuItem eventKey={property} key={`workers-dropdown-${key}`}>
                {property}
              </MenuItem>
            ))}
          </DropdownButton>
        </div>
        {error && <Error error={error} />}
        {loading && <Spinner />}
        <Table className={styles.workersTable} responsive condensed={true} hover={true}>
          <thead>
            <tr>
              <th title="Worker ID">Worker ID</th>
              <th title="Most Recent Task">MRT</th>
              <th title="First Claim">First Claim</th>
              <th title="Most Recent Task Started">MRT Started</th>
              <th title="Most Recent Task Resolved">MRT Resolved</th>
              <th title="Status">Status</th>
            </tr>
          </thead>
          <tbody>
            {!loading && workers && (
              workers.workers.map((worker, index) => (
                <tr key={`worker-${index}`}>
                  <td>
                    <Link
                      to={`/workers/provisioners/${this.props.provisionerId}/worker-types/${this.props.workerType}/workers/${worker.workerGroup}/${worker.workerId}`}>
                      {worker.workerId}
                    </Link>
                  </td>
                  <td>{worker.latestTask ? <Link to={`/tasks/${worker.latestTask}`}>{worker.latestTask}</Link> : '-'}</td>
                  <td>{worker.firstClaim ? <DateView date={worker.firstClaim} /> : '-'}</td>
                  <td>{worker.lastClaimStarted ? <DateView date={worker.lastClaimStarted} /> : '-'}</td>
                  <td>{worker.lastClaimResolved ? <DateView date={worker.lastClaimResolved} since={worker.lastClaimStarted} /> : '-'}</td>
                  <td>
                    <Label bsSize="sm" bsStyle={worker.disabled ? 'danger' : 'success'}>{worker.disabled ? 'disabled' : 'enabled'}</Label>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
        {workers && !workers.workers.length && !loading && (
          <div>There are no {filter !== 'None' ? filter : ''} workers in <code>{`${this.props.provisionerId}/${this.props.workerType}`}</code></div>
        )}
        <div className={styles.pagination}>
          <ButtonGroup>
            <Button
              disabled={!workerToken}
              onClick={this.clearWorkerToken}>
              <Glyphicon glyph="arrow-left" />&nbsp;&nbsp;Back to start
            </Button>
            <Button
              disabled={workers && !workers.continuationToken}
              onClick={this.nextWorkers}>More workers&nbsp;&nbsp;<Glyphicon glyph="arrow-right" />
            </Button>
          </ButtonGroup>
        </div>
      </div>
    );
  }
}
