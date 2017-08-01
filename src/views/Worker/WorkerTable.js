import React from 'react';
import { Table, Label, Popover, OverlayTrigger, ButtonToolbar, DropdownButton, MenuItem } from 'react-bootstrap';
import moment from 'moment';
import { array } from 'prop-types';
import Icon from 'react-fontawesome';
import { titleCase } from 'change-case';
import Markdown from '../../components/Markdown';
import { labels } from '../../utils';
import styles from './styles.css';

export default class WorkerTable extends React.PureComponent {
  static propTypes = {
    tasks: array.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      filterStatus: 'all'
    };
  }
  renderTaskMetadata = ({ metadata }, { taskGroupId, taskId }) => (
    <Popover
      className={styles.metadataPopover}
      id="popover-trigger-click-root-close"
      title={
        <a target="_blank" rel="noopener noreferrer" href={`/groups/${taskGroupId}/tasks/${taskId}`}>
          {taskId}&nbsp;&nbsp;<Icon name="long-arrow-right" />
        </a>
      }>
      <div>
        <Table responsive>
          <thead>
            <tr>
              <td><strong>Name</strong></td>
              <td><strong>Owner</strong></td>
              <td><strong>Description</strong></td>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>
                <a target="_blank" rel="noopener noreferrer" href={metadata.source}>{metadata.name}</a>
              </td>
              <td>{metadata.owner}</td>
              <td>
                {metadata.description ?
                  <Markdown>{metadata.description}</Markdown> :
                  <Markdown>`-`</Markdown>
                }
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    </Popover>
  );

  renderTask = ({ task, status }, index) => {
    const runId = status.runs.length - 1;
    const run = status.runs[runId];
    const metadata = this.renderTaskMetadata(task, status);

    return (
      <tr key={`recent-task-${index}`}>
        <td><Label bsSize="sm" bsStyle={labels[status.state]}>{status.state}</Label></td>
        <td>
          <OverlayTrigger trigger="click" rootClose placement="bottom" overlay={metadata}>
            <a
              target="_blank"
              role="button"
              rel="noopener noreferrer">
              {status.taskId}
            </a>
          </OverlayTrigger>
        </td>
        <td>{status.schedulerId}</td>
        <td>{run.scheduled ? moment(run.scheduled).fromNow() : '-'}</td>
        <td>{run.started ? moment(run.started).fromNow() : '-'}</td>
        <td>{run.resolved ? moment(run.resolved).fromNow() : '-'}</td>
      </tr>
    );
  };

  handleSelect = filterStatus => this.setState({ filterStatus });

  tasksToRender = () => {
    const { tasks } = this.props;
    const { filterStatus } = this.state;

    if (!tasks) {
      return [];
    }

    const sort = tasks => tasks
      .sort((a, b) => a.task.metadata.name.localeCompare(b.task.metadata.name, { sensitivity: 'base' }));

    if (filterStatus !== 'all') {
      return sort(tasks.filter(task => task.status.state === filterStatus));
    }

    return sort(tasks);
  };

  render() {
    const groups = Object.keys(labels);
    const tasksToRender = this.tasksToRender();
    const { filterStatus } = this.state;

    return (
      <div className={styles.recentTasksTable}>
        <hr />
        <h5>Recent Task IDs claimed</h5>
        <Table responsive>
          <thead>
            <tr>
              <th>
                <ButtonToolbar>
                  <DropdownButton
                    bsSize="xsmall"
                    title={`Status: ${titleCase(filterStatus)}`}
                    id="group-details-status-dropdown"
                    onSelect={this.handleSelect}>
                    <MenuItem eventKey="all">All</MenuItem>
                    <MenuItem divider />
                    {groups.map(group => (
                      <MenuItem eventKey={group} key={`group-details-status-dropdown-${group}`}>
                        {titleCase(group)}
                      </MenuItem>
                    ))}
                  </DropdownButton>
                </ButtonToolbar>
              </th>
              <th>Task ID</th>
              <th>Scheduler ID</th>
              <th>Scheduled</th>
              <th>Started</th>
              <th>Resolved</th>
            </tr>
          </thead>
          <tbody>
            {tasksToRender.length ?
              tasksToRender.map(this.renderTask) :
              (
                <tr colSpan={2}>
                  <td>
                    <em>
                      {
                        filterStatus !== 'all' ?
                          `There are no tasks in this worker in the "${filterStatus}" state` :
                          'There are no tasks to display for this worker'
                      }
                    </em>
                  </td>
                </tr>
              )
            }
          </tbody>
        </Table>
      </div>
    );
  }
}
