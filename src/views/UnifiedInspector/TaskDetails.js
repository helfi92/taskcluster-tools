import React from 'react';
import { object } from 'prop-types';
import { Link } from 'react-router-dom';
import { Table, Label } from 'react-bootstrap';
import Icon from 'react-fontawesome';
import BarSpinner from '../../components/BarSpinner';
import Markdown from '../../components/Markdown';
import Code from '../../components/Code';
import DateView from '../../components/DateView';
import { labels } from '../../utils';

export default class TaskDetails extends React.PureComponent {
  static propTypes = {
    status: object,
    task: object
  };

  constructor(props) {
    super(props);

    this.state = {
      dependencies: [],
      dependenciesLoading: false
    };
  }

  loadDependencies(taskIds) {
    const dependencies = {};

    this.setState({ dependenciesLoading: true }, async () => {
      try {
        await Promise.all(
          taskIds.map(async taskId => {
            const [task, { status }] = await Promise.all([
              this.props.queue.task(taskId),
              this.props.queue.status(taskId)
            ]);

            dependencies[taskId] = {
              task,
              status
            };
          })
        );

        this.setState({ dependencies, dependenciesLoading: false });
      } catch (error) {
        this.setState({ error });
      }
    });
  }

  componentWillReceiveProps({ task }) {
    if (!this.props.task && task) {
      this.loadDependencies(task.dependencies);
    }
  }

  render() {
    const { status, task } = this.props;
    const { dependencies, dependenciesLoading } = this.state;

    if (!status || !task) {
      return null;
    }

    const { metadata } = task;

    return (
      <div>
        <Table>
          <tbody>
            <tr>
              <td style={{ borderTop: 'none' }}>Name</td>
              <td style={{ borderTop: 'none' }}>
                <Markdown>{metadata.name}</Markdown>
              </td>
            </tr>

            <tr>
              <td>Description</td>
              <td>
                <Markdown>{metadata.description}</Markdown>
              </td>
            </tr>

            <tr>
              <td>Owner</td>
              <td>
                <code>{metadata.owner}</code>
              </td>
            </tr>

            <tr>
              <td>Source</td>
              <td>
                <a href={metadata.source}>
                  <span>
                    {metadata.source.length > 90
                      ? `...${metadata.source.substr(8 - 90)}`
                      : metadata.source}
                  </span>
                </a>
              </td>
            </tr>

            <tr>
              <td>State</td>
              <td>
                <Label bsStyle={labels[status.state]}>{status.state}</Label>
              </td>
            </tr>

            <tr>
              <td>Retries Left</td>
              <td>
                {status.retriesLeft} of {task.retries}
              </td>
            </tr>

            <tr>
              <td>Created</td>
              <td>
                <DateView date={task.created} />
              </td>
            </tr>

            <tr>
              <td>Deadline</td>
              <td>
                <DateView date={task.deadline} since={task.created} />
              </td>
            </tr>

            <tr>
              <td>Expires</td>
              <td>
                <DateView date={task.expires} />
              </td>
            </tr>

            <tr>
              <td>Priority</td>
              <td>
                <code>{task.priority}</code>
              </td>
            </tr>

            <tr>
              <td>Provisioner</td>
              <td>
                <code>{task.provisionerId}</code>
              </td>
            </tr>

            <tr>
              <td>WorkerType</td>
              <td>
                <Link
                  to={`/provisioners/${task.provisionerId}/worker-types/${task.workerType}`}>
                  {task.workerType}
                </Link>
              </td>
            </tr>

            <tr>
              <td>SchedulerId</td>
              <td>
                <code>{task.schedulerId}</code>
              </td>
            </tr>

            <tr>
              <td>Dependencies</td>
              <td>
                <Table condensed>
                  <thead>
                    <tr>
                      <td>Task ID</td>
                      <td>Task Name</td>
                      <td>Task Status</td>
                    </tr>
                  </thead>
                  <tbody>
                    {task.dependencies.length
                      ? task.dependencies.map((dependency, key) => (
                          <tr key={`task-dependency-${key}`}>
                            <td>
                              <Link to={`/tasks/${dependency}`}>
                                {dependency}
                              </Link>
                            </td>
                            <td>
                              {dependenciesLoading ? (
                                <BarSpinner />
                              ) : (
                                dependencies[dependency].task.metadata.name
                              )}
                            </td>
                            <td>
                              {dependenciesLoading ? (
                                <BarSpinner />
                              ) : (
                                <Label
                                  bsStyle={
                                    labels[
                                      dependencies[dependency].status.state
                                    ]
                                  }>
                                  {dependencies[dependency].status.state}
                                </Label>
                              )}
                            </td>
                          </tr>
                        ))
                      : '-'}
                  </tbody>
                </Table>
              </td>
            </tr>

            <tr>
              <td>Tags</td>
              <td>
                {(() => {
                  const entries = Object.entries(task.tags);

                  if (!entries.length) {
                    return '-';
                  }

                  return (
                    <table>
                      <tbody>
                        {entries.map(([key, value]) => (
                          <tr key={`task-tag-${key}`}>
                            <td>
                              <strong>
                                <em>{key}</em>
                              </strong>&nbsp;&nbsp;&nbsp;
                            </td>
                            <td>{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
              </td>
            </tr>

            <tr>
              <td>Requires</td>
              <td>
                This task will be scheduled when <em>dependencies</em> are
                {task.requires === 'all-completed' ? (
                  <span>
                    {' '}
                    <code>all-completed</code> successfully.
                  </span>
                ) : (
                  <span>
                    {' '}
                    <code>all-resolved</code> with any resolution.
                  </span>
                )}
              </td>
            </tr>

            <tr>
              <td>Scopes</td>
              <td>
                {task.scopes.length
                  ? task.scopes.map((scope, key) => (
                      <div key={`task-scopes-${key}`}>
                        <code>{scope}</code>
                      </div>
                    ))
                  : '-'}
              </td>
            </tr>

            <tr>
              <td>Routes</td>
              <td>
                {task.routes.length
                  ? task.routes.map((route, key) => (
                      <div key={`task-routes-${key}`}>
                        <code>{route}</code>
                      </div>
                    ))
                  : '-'}
              </td>
            </tr>

            <tr>
              <td>Task Definition</td>
              <td>
                <a
                  href={`https://queue.taskcluster.net/v1/task/${status.taskId}`}
                  target="_blank"
                  rel="noopener noreferrer">
                  {status.taskId} <Icon name="external-link" />
                </a>
              </td>
            </tr>

            <tr>
              <td>Payload</td>
              <td>
                <Code language="json">
                  {JSON.stringify(task.payload, null, 2)}
                </Code>
              </td>
            </tr>

            {Object.keys(task.extra).length ? (
              <tr>
                <td>Extra</td>
                <td>
                  <Code language="json">
                    {JSON.stringify(task.extra, null, 2)}
                  </Code>
                </td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </div>
    );
  }
}
