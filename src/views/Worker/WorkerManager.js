import React, { Component } from 'react';
import moment from 'moment';
import { Table, Button, ButtonToolbar } from 'react-bootstrap';
import HelmetTitle from '../../components/HelmetTitle';
import Error from '../../components/Error';
import Spinner from '../../components/Spinner';
import SearchForm from './SearchForm';
import WorkerTable from './WorkerTable';
import styles from './styles.css';

class WorkerManager extends Component {
  constructor(props) {
    super(props);

    this.state = {
      provisioners: [],
      workerTypes: [],
      recentTasks: [],
      worker: null,
      error: null,
      loading: false
    };
  }

  componentWillMount() {
    const { provisionerId, workerType, workerGroup, workerId } = this.props;

    if (provisionerId && workerType && workerGroup && workerId) {
      this.loadWorker(provisionerId, workerType, workerGroup, workerId);
    }

    if (provisionerId) {
      this.loadWorkerTypes(this.props);
    }

    this.loadProvisioners();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.provisionerId !== nextProps.provisionerId) {
      this.loadWorkerTypes(nextProps);
    }
  }

  async loadProvisioners() {
    this.setState({ provisioners: [] }, async () => {
      try {
        const { provisioners } = await this.props.queue.listProvisioners();

        this.setState({ provisioners });
      } catch (err) {
        this.setState({ provisioners: null, error: err });
      }
    });
  }

  async loadWorkerTypes({ provisionerId }) {
    this.setState({ workerTypes: [], error: null }, async () => {
      try {
        const { workerTypes } = await this.props.queue.listWorkerTypes(provisionerId);

        this.setState({ workerTypes, error: null });
      } catch (err) {
        this.setState({ workerTypes: [], error: err });
      }
    });
  }

  loadWorker = async (provisionerId, workerType, workerGroup, workerId) => {
    this.setState({ worker: null, loading: true, error: null }, async () => {
      try {
        const worker = await this.props.queue.getWorker(provisionerId, workerType, workerGroup, workerId);
        const recentTasks = await this.loadRecentTasks(worker.recentTasks);

        this.setState({ worker, recentTasks, loading: false, error: null });
      } catch (err) {
        this.setState({ worker: null, recentTasks: [], loading: false, error: err });
      }
    });
  };

  loadRecentTasks = taskIds => (
    Promise.all(taskIds.map(async (taskId) => {
      const task = await this.props.queue.task(taskId);
      const { status } = await this.props.queue.status(taskId);

      return { task, status };
    }))
  );

  updateURI = (provisionerId, workerType, workerGroup, workerId, push) => {
    const encode = prop => (prop ? `/${encodeURIComponent(prop)}` : '');

    this.props.history[push ? 'push' : 'replace'](
      `/worker${encode(provisionerId)}${encode(workerType)}${encode(workerGroup)}${encode(workerId)}`
    );
  };

  renderHeader = () => (
    <div key="header">
      <HelmetTitle title="Worker Explorer" />
      <h4>Worker Explorer</h4>
    </div>
  );

  renderSearchForm = () => (
    <SearchForm
      key="input-form"
      provisioners={this.state.provisioners}
      workerTypes={this.state.workerTypes}
      provisionerId={this.props.provisionerId}
      workerType={this.props.workerType}
      workerGroup={this.props.workerGroup}
      workerId={this.props.workerId}
      updateURI={this.updateURI}
      loadWorker={this.loadWorker} />
  );

  renderWorkerMetadata = () => (
    <div key="worker-metadata">
      <Table className={styles.metadataTable} condensed responsive>
        <tbody>
          <tr>
            <td>First Claim</td>
            <td>{moment(this.state.worker.firstClaim).fromNow()}</td>
          </tr>
          <tr>
            <td style={{ verticalAlign: 'inherit' }}>Actions</td>
            <td>
              <ButtonToolbar>
                <Button disabled title="Coming soon!" bsSize="small" bsStyle="info">Reboot</Button>
                <Button disabled title="Coming soon!" bsSize="small" bsStyle="warning">Disable</Button>
                <Button disabled title="Coming soon!" bsSize="small" bsStyle="danger">Kill</Button>
              </ButtonToolbar>
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );

  render() {
    if (this.state.error) {
      return (
        <div>
          {[
            this.renderHeader(),
            this.renderSearchForm(),
            <Error key="error" error={this.state.error} />
          ]}
        </div>
      );
    }

    return (
      <div>
        {[
          this.renderHeader(),
          this.renderSearchForm(),
          this.state.loading ? <Spinner key="spinner" /> : null,
          this.state.worker && this.renderWorkerMetadata(),
          this.state.worker && <WorkerTable tasks={this.state.recentTasks} key="worker-table" />
        ]}
      </div>
    );
  }
}

export default WorkerManager;
