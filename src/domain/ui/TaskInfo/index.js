import R from 'ramda';
import React from 'react';
import { view, forwardTo } from 'redux-elm';
import { Link } from 'react-router';
import Spinner from '../Spinner';
import Markdown from '../Markdown';
import ConfirmAction from '../ConfirmAction';
import LoanerButtons from '../LoanerButtons';
import RetriggerButton from '../RetriggerButton';
import PurgeCacheButton from '../PurgeCacheButton';
import DateView from '../DateView';
import Highlight from '../Highlight';
import RunLocallyScript from './RunLocallyScript';
import {
  PURGE_CACHE_BUTTON,
  RETRIGGER_BUTTON,
  LOANER_BUTTONS,
  CONFIRM_SCHEDULE_TASK,
  CONFIRM_CANCEL_TASK,
  CONFIRM_EDIT_TASK
} from './updater';

import './index.scss';

/**
 * maybeEllipsis :: String -> String
 */
const maybeEllipsis = R.cond([
  [R.pipe(R.length, R.gt(90)), R.slice(8, 90)],
  [R.T, R.identity]
]);

/**
 * isResolved :: a -> Boolean
 */
const isResolved = R.contains(R.__, ['completed', 'failed', 'exception']);

export default view(({ model, dispatch }) => {
  if (model.taskLoading) {
    return <Spinner />;
  }

  if (!model.taskLoaded) {
    return <span></span>;
  }

  const { task, taskStatus, label } = model;
  const { metadata } = task;
  const scheduleTask = () => dispatch({ type: CONFIRM_SCHEDULE_TASK });
  const cancelTask = () => dispatch({ type: CONFIRM_CANCEL_TASK });
  const editTask = () => dispatch({ type: CONFIRM_EDIT_TASK });

  return (
    <span className="task-info">
      <dl className="dl-horizontal">
        <dt>Name</dt>
        <dd>
          <Markdown>
            {metadata.name}
          </Markdown>
        </dd>

        <dt>Description</dt>
        <dd>
          <Markdown>
            {metadata.description}
          </Markdown>
        </dd>

        <dt>Owner</dt>
        <dd><code>{metadata.owner}</code></dd>

        <dt>Source</dt>
        <dd>
          <Link to={metadata.source}>{maybeEllipsis(metadata.source)}</Link>
        </dd>
      </dl>

      <dl className="dl-horizontal">
        <dt>State</dt>
        <dd>
          <span className={label}>{taskStatus.state}</span>
        </dd>

        <dt>Retries Left</dt>
        <dd>{taskStatus.retriesLeft} of {task.retries}</dd>

        <dt>Actions</dt>
        <dd className="actions">
          <ConfirmAction
            model={model.confirmScheduleTask}
            dispatch={forwardTo(dispatch, CONFIRM_SCHEDULE_TASK)}
            bsSize="xsmall"
            bsStyle="primary"
            disabled={taskStatus.state !== 'unscheduled'}
            glyph="play"
            label="Schedule Task"
            success="Successfully scheduled task!"
            action={scheduleTask}>
              Are you sure you wish to schedule the task? This will <strong>overwrite any scheduling process</strong>
              taking place. If this task is part of a continuous integration process, scheduling this task may cause
              your code to land with broken tests.
          </ConfirmAction>
          <RetriggerButton
            model={model.retriggerButton}
            dispatch={forwardTo(dispatch, RETRIGGER_BUTTON)}
            bsStyle="success"
            bsSize="xsmall" />
          <ConfirmAction
            model={model.confirmCancelTask}
            dispatch={forwardTo(dispatch, CONFIRM_CANCEL_TASK)}
            bsSize="xsmall"
            bsStyle="danger"
            disabled={isResolved(taskStatus.state)}
            glyph="stop"
            label="Cancel Task"
            success="Successfully cancelled task!"
            action={cancelTask}>
              Are you sure you wish to cancel this task?
              Notice that another process or person may still be able to schedule a re-run.
              All existing runs will be aborted and any scheduling process will not be able to schedule the task.
          </ConfirmAction>
          <PurgeCacheButton
            model={model.purgeCacheButton}
            dispatch={forwardTo(dispatch, PURGE_CACHE_BUTTON)} />
        </dd>
      </dl>

      <dl className="dl-horizontal">
        <dt>Created</dt>
        <dd><DateView id="task-created-dateview" date={task.created} /></dd>

        <dt>Deadline</dt>
        <dd><DateView id="task-deadline-dateview" date={task.deadline} since={task.created} /></dd>
      </dl>

      <dl className="dl-horizontal">
        <dt>ProvisionerId</dt>
        <dd><code>{task.provisionerId}</code></dd>

        <dt>WorkerType</dt>
        <dd><code>{task.workerType}</code></dd>
      </dl>

      <dl className="dl-horizontal">
        <dt>SchedulerId</dt>
        <dd><code>{task.schedulerId}</code></dd>

        <dt>TaskGroupId</dt>
        <dd>
          <Link to={`/task-group-inspector/${task.taskGroupId}`}>{task.taskGroupId}</Link>
        </dd>

        <dt>Dependencies</dt>
        <dd>
          {
            !task.dependencies.length ?
              '-' :
              (
                <ul>
                  {task.dependencies.map((dependency, index) => (
                    <li key={index}><Link to={`/task-inspector/${dependency}`}>{dependency}</Link></li>
                  ))}
                </ul>
              )
          }
        </dd>

        <dt>Requires</dt>
        <dd>
          This task will be scheduled when <em>dependencies</em> are
          <span>
            <code>{task.requires === 'all-completed' ? 'all-completed' : 'all-resolved'}</code>
            {task.required === 'all-completed' ? 'successfully' : 'with any resolution'}.
          </span>
        </dd>
      </dl>

      <dl className="dl-horizontal">
        <dt>Scopes</dt>
        <dd>
          {
            !task.scopes.length ?
              '-' :
              <ul>{task.scopes.map((scope, index) => <li key={index}><code>{scope}</code></li>)}</ul>
          }
        </dd>

        <dt>Routes</dt>
        <dd>
          {
            !task.routes.length ?
              '-' :
              <ul>{task.routes.map((route, index) => <li key={index}><code>{route}</code></li>)}</ul>
          }
        </dd>
      </dl>

      <dl className="dl-horizontal">
        <dt>Task Definition</dt>
        <dd>
          <a href={`https://queue.taskcluster.net/v1/task/${taskStatus.taskId}`} target="_blank">
            {taskStatus.taskId} <i className="fa fa-external-link" />
          </a>
        </dd>

        <dt>Payload</dt>
        <dd><Highlight language="json">{JSON.stringify(task.payload, null, 2)}</Highlight></dd>

        <dt>Debug</dt>
        <dd className="debug-actions">
          <ConfirmAction
            model={model.confirmEditTask}
            dispatch={forwardTo(dispatch, CONFIRM_EDIT_TASK)}
            bsSize="small"
            bsStyle="default"
            glyph="edit"
            label="Edit and Re-create"
            success="Opening Task Creator"
            action={editTask}>
              Are you sure you wish to edit this task?
              <p>
                Note that the edited task will not be linked to other tasks or have the same <code>task.routes</code>
                as other tasks, so this is not a way to "fix" a failing task in a larger task graph. Note that you may
                also not have the scopes required to create the resulting task.
              </p>
          </ConfirmAction>
          <LoanerButtons
            model={model.loanerButtons}
            dispatch={forwardTo(dispatch, LOANER_BUTTONS)}
            bsStyle="default"
            bsSize="small" />
        </dd>
      </dl>

      <dl className="dl-horizontal">
        <dt>Run Locally</dt>
        <dd>
          <Highlight language="bash">
            {RunLocallyScript({ taskId: taskStatus.taskId, payload: task.payload })}
          </Highlight>
        </dd>
      </dl>
    </span>
  );
});


















//
//
//
//
//
//
//
//
//
//
// let ConfirmAction     = require('./confirmaction');
// let LoanerButton      = require('./loaner-button');
// let PurgeCacheButton  = require('./purgecache-button');
// let React             = require('react');
// let RetriggerButton   = require('./retrigger-button');
// let _                 = require('lodash');
// let bs                = require('react-bootstrap');
// let format            = require('../format');
// let path              = require('path');
// let taskcluster       = require('taskcluster-client');
// let utils             = require('../utils');
//
// /** Displays information about a task in a tab page */
// var TaskInfo = React.createClass({
//   mixins: [
//     // Calls load() initially and on reload()
//     utils.createTaskClusterMixin({
//       // Need updated clients for Queue
//       clients: {
//         queue:                taskcluster.Queue
//       },
//       // Reload when props.status.taskId changes, ignore credential changes
//       reloadOnProps:          ['status.taskId'],
//       reloadOnLogin:          false
//     })
//   ],
//
//   // Validate properties
//   propTypes: {
//     status:   React.PropTypes.object.isRequired
//   },
//
//   /** Get initial state */
//   getInitialState() {
//     return {
//       // task definition
//       taskLoaded:         false,
//       taskError:          undefined,
//       task:               undefined
//     };
//   },
//
//   /** Load task definition */
//   load() {
//     return {
//       task: this.queue.task(this.props.status.taskId)
//     };
//   },
//
//   render() {
//     // Easy references to values
//     var status  = this.props.status;
//     var task    = this.state.task;
//
//     var taskStateLabel = {
//       unscheduled:      'label label-default',
//       pending:          'label label-info',
//       running:          'label label-primary',
//       completed:        'label label-success',
//       failed:           'label label-danger',
//       exception:        'label label-warning'
//     };
//
//     var isResolved = [
//         'completed',
//         'failed',
//         'exception'
//       ].indexOf(status.state) !== -1;
//
//     return this.renderWaitFor('task') || (
//         <span>
//       <dl className="dl-horizontal">
//         <dt>Name</dt>
//         <dd>
//           <format.Markdown>
//             {task.metadata.name}
//           </format.Markdown>
//         </dd>
//         <dt>Description</dt>
//         <dd>
//           <format.Markdown>
//             {task.metadata.description}
//           </format.Markdown>
//         </dd>
//         <dt>Owner</dt>
//         <dd><code>{task.metadata.owner}</code></dd>
//         <dt>Source</dt>
//         <dd>
//           <a href={task.metadata.source}>
//             {
//               task.metadata.source.length > 90 ? (
//                 <span>...{task.metadata.source.substr(8 - 90)}</span>
//               ) : (
//                 <span>{task.metadata.source}</span>
//               )
//             }
//           </a>
//         </dd>
//       </dl>
//       <dl className="dl-horizontal">
//         <dt>State</dt>
//         <dd>
//           <span className={taskStateLabel[status.state]}>
//             {status.state}
//           </span>
//         </dd>
//         <dt>Retries Left</dt>
//         <dd>{status.retriesLeft} of {task.retries}</dd>
//         <dt>Actions</dt>
//         <dd>
//           <ConfirmAction buttonSize="xsmall"
//                          buttonStyle="primary"
//                          disabled={status.state !== 'unscheduled'}
//                          glyph="play"
//                          label="Schedule Task"
//                          action={this.scheduleTask}
//                          success="Successfully scheduled task!">
//             Are you sure you wish to schedule the task?
//             This will <b>overwrite any scheduling process</b> taking place,
//             if this task is part of a continous integration process scheduling
//             this task may cause your code to land with broken tests.
//           </ConfirmAction>&nbsp;
//           <RetriggerButton task={this.state.task}
//                            taskId={status.taskId}
//                            buttonStyle="success"
//                            buttonSize="xsmall"/>&nbsp;
//           <ConfirmAction buttonSize="xsmall"
//                          buttonStyle="danger"
//                          disabled={isResolved}
//                          glyph="stop"
//                          label="Cancel Task"
//                          action={this.cancelTask}
//                          success="Successfully canceled task!">
//             Are you sure you wish to cancel this task?
//             Notice that another process or developer may still be able to
//             schedule a rerun. But all existing runs will be aborted and any
//             scheduling process will not be able to schedule the task.
//           </ConfirmAction>&nbsp;
//           <PurgeCacheButton caches={_.keys(((task || {}).payload || {}).cache || {})}
//                             provisionerId={task.provisionerId}
//                             workerType={task.workerType}/>&nbsp;
//         </dd>
//       </dl>
//       <dl className="dl-horizontal">
//         <dt>Created</dt>
//         <dd>
//           <format.DateView date={task.created}/>
//         </dd>
//         <dt>Deadline</dt>
//         <dd>
//           <format.DateView date={task.deadline} since={task.created}/>
//         </dd>
//       </dl>
//       <dl className="dl-horizontal">
//         <dt>ProvisionerId</dt>
//         <dd><code>{task.provisionerId}</code></dd>
//         <dt>WorkerType</dt>
//         <dd><code>{task.workerType}</code></dd>
//       </dl>
//       <dl className="dl-horizontal">
//         <dt>SchedulerId</dt>
//         <dd><code>{task.schedulerId}</code></dd>
//         <dt>TaskGroupId</dt>
//         <dd>
//           <a href={'../task-group-inspector/#' + task.taskGroupId}>
//             {task.taskGroupId}
//           </a>
//         </dd>
//         <dt>Dependencies</dt>
//         <dd>
//           {
//             task.dependencies.length > 0 ? (
//               <ul>
//                 {
//                   task.dependencies.map((dep, index) => {
//                     return (
//                       <li key={index}>
//                         <a href={'../task-inspector/#' + dep}>{dep}</a>
//                       </li>
//                     );
//                   })
//                 }
//               </ul>
//             ) : (
//               '-'
//             )
//           }
//         </dd>
//         <dt>Requires</dt>
//         <dd>
//           This task will be scheduled when <i>dependencies</i> are
//           {
//             task.requires === 'all-completed' ?
//               <span> <code>all-completed</code> successfully</span>
//               :
//               <span> <code>all-resolved</code> with any resolution</span>
//           }
//           .
//         </dd>
//       </dl>
//       <dl className="dl-horizontal">
//         <dt>Scopes</dt>
//         <dd>
//           {
//             task.scopes.length > 0 ? (
//               <ul>
//                 {
//                   task.scopes.map((scope, index) => {
//                     return <li key={index}><code>{scope}</code></li>;
//                   })
//                 }
//               </ul>
//             ) : (
//               '-'
//             )
//           }
//         </dd>
//         <dt>Routes</dt>
//         <dd>
//           {
//             task.routes.length > 0 ? (
//               <ul>
//                 {
//                   task.routes.map((route, index) => {
//                     return <li key={index}><code>{route}</code></li>
//                   })
//                 }
//               </ul>
//             ) : (
//               '-'
//             )
//           }
//         </dd>
//       </dl>
//       <dl className="dl-horizontal">
//         <dt>Task Definition</dt>
//         <dd>
//           <a href={'https://queue.taskcluster.net/v1/task/' + status.taskId}
//              target="_blank">
//             {status.taskId}
//             &nbsp;
//             <i className="fa fa-external-link"></i>
//           </a>
//         </dd>
//         <dt>Payload</dt>
//         <dd>
//           <format.Code language='json'>
//             {JSON.stringify(task.payload, undefined, 2)}
//           </format.Code>
//         </dd>
//         <dt>Debug</dt>
//         <dd>
//           <ConfirmAction buttonSize="small"
//                          buttonStyle="default"
//                          glyph="edit"
//                          label="Edit and Re-create"
//                          action={this.editTask}
//                          success="Opening Task Creator">
//             Are you sure you wish to edit this task?<br/>
//             Note that the edited task will not be linked to other tasks or
//             have the same <code>task.routes</code> as other tasks,
//             so this is not a way to "fix" a failing task in a larger task graph.
//             Note that you may also not have the scopes required to create the
//             resulting task.
//           </ConfirmAction>&nbsp;
//           <LoanerButton task={this.state.task}
//                         taskId={status.taskId}
//                         buttonStyle="default"
//                         buttonSize="small"/>&nbsp;
//         </dd>
//       </dl>
//       <dl className="dl-horizontal">
//         <dt>Run Locally</dt>
//         <dd>
//           <format.Code language='bash'>
//             {this.renderRunLocallyScript()}
//           </format.Code>
//         </dd>
//       </dl>
//       </span>
//       );
//   },
//
//   scheduleTask() {
//     return this.queue.scheduleTask(this.props.status.taskId);
//   },
//   rerunTask() {
//     return this.queue.rerunTask(this.props.status.taskId);
//   },
//   cancelTask() {
//     return this.queue.cancelTask(this.props.status.taskId);
//   },
//   editTask() {
//     var newTask = {
//       // filled in by task creator on load
//       created: null,
//       deadline: null,
//     };
//     // copy fields from the parent task, intentionally excluding some
//     // fields which might cause confusion if left unchanged
//     var exclude = [
//       'routes',
//       'taskGroupId',
//       'schedulerId',
//       'priority',
//       'created',
//       'deadline',
//       'dependencies',
//       'requires'
//     ];
//     _.keys(this.state.task).forEach(key => {
//       if (!_.includes(exclude, key)) {
//         newTask[key] = this.state.task[key];
//       }
//     });
//
//     // overwrite task-creator's local state with this new task
//     localStorage.setItem("task-creator/task", JSON.stringify(newTask));
//
//     // ..and go there
//     window.location.href = '../task-creator';
//   },
//
//   /** Render script illustrating how to run locally */
//   renderRunLocallyScript() {
//     // Note:
//     // We ignore cache folders, as they'll just be empty, which is fine.
//     // TODO: Implement support for task.payload.features such as:
//     //        - taskclusterProxy
//     //        - testdroidProxy
//     //        - balrogVPNProxy
//     //       We can do this with --link and demonstrate how to inject
//     //       credentials using environment variables
//     //       (obviously we can provide the credentials)
//     var taskId  = this.props.status.taskId;
//     var payload = this.state.task.payload;
//     var cmds = [];
//     var imagePullCmds= [];
//     var deviceCmds = [];
//
//     if (!payload.image) {
//       return "# Could not infer task payload format";
//     }
//
//     cmds.push("#!/bin/bash -e");
//     cmds.push("# WARNING: this is experimental mileage may vary!");
//     cmds.push("");
//
//     if (typeof payload.image === 'string') {
//       imagePullCmds.push("# Image appears to be a Docker Hub Image. Fetch docker image");
//       imagePullCmds.push('image_name=' + payload.image);
//       imagePullCmds.push("docker pull '" + payload.image + "'");
//     } else if (typeof payload.image === 'object') {
//       if (!payload.image.type || payload.image.type !== 'task-image') {
//         return "# Failed to infer task payload format";
//       }
//       var imagePath = payload.image.path;
//       var imageTaskId = payload.image.taskId;
//       imagePullCmds.push("# Image appears to be a task image");
//       imagePullCmds.push("# Download image tarball from task");
//       imagePullCmds.push("curl -L -o image.tar https://queue.taskcluster.net/v1/task/" + imageTaskId + "/artifacts/" + imagePath);
//       imagePullCmds.push("");
//       imagePullCmds.push("# Extract image name and tag from image tarball");
//       imagePullCmds.push("# Note: jq is required.  Download the package appropriate");
//       imagePullCmds.push("# for your OS at https://stedolan.github.io/jq/");
//       imagePullCmds.push("image=$(tar xf image.tar -O repositories | jq -r 'keys[0]')");
//       imagePullCmds.push("image_tag=$(tar xf image.tar -O repositories | jq -r '.[keys[0]] | keys[0]')");
//       imagePullCmds.push("image_name=$image:$image_tag");
//       imagePullCmds.push("");
//       imagePullCmds.push("# Load docker image from tarball");
//       imagePullCmds.push("docker load < image.tar");
//     } else {
//       return "# Failed to infer task payload format";
//     }
//
//     // TODO Add devices other than loopback at some point
//     if (payload.capabilities && payload.capabilities.devices) {
//       cmds.push("");
//       cmds.push("# Task uses the following devices :");
//       cmds.push("# " + Object.keys(payload.capabilities.devices).join(', '));
//       cmds.push("");
//       cmds.push("# Warning: This is entirely dependent on local setup and ");
//       cmds.push("# availability of devices.");
//       cmds.push("");
//       if (payload.capabilities.devices['loopbackVideo']) {
//         cmds.push("# This job requires access to your video device.");
//         cmds.push("");
//         cmds.push("if [[ `apt-cache search v4l2loopback-dkms | wc -l` -eq 0 ]]; then");
//         cmds.push("  echo 'We are going to install v42loopback-dkms on your host.'");
//         cmds.push("  echo 'If you are OK with it type your root password.'");
//         cmds.push("  sudo apt-get install -qq -f v4l2loopback-dkms");
//         cmds.push("fi");
//         cmds.push("");
//         cmds.push("if [[ `lsmod | grep \"v4l2loopback\" | wc -l` -eq 0 ]]; then");
//         cmds.push("  echo 'We are going to create a video device under /dev/video*'");
//         cmds.push("  echo 'This needs to happen everytime after you reboot your machine.'");
//         cmds.push("  echo 'If you are OK with it type your root password.'");
//         cmds.push("  sudo modprobe v4l2loopback");
//         cmds.push("fi");
//         cmds.push("");
//         cmds.push("last_device=`ls /dev/video* | tail -n 1`");
//         deviceCmds.push("  --device $last_device:$last_device \\");
//       }
//       if (payload.capabilities.devices['loopbackAudio']) {
//         cmds.push("# This job requires access to your audio device.");
//         cmds.push("");
//         cmds.push("# This command will create virtual devices under /dev/snd*");
//         cmds.push("# sudo modprobe snd-aloop");
//         cmds.push("");
//         cmds.push("# Adjust the following list of --devices to match your host. Pick the most recently created ones.");
//         deviceCmds.push("  --device /dev/snd/controlC0:/dev/snd/controlC0 \\");
//         deviceCmds.push("  --device /dev/snd/pcmC0D0c:/dev/snd/pcmC0D0c \\");
//         deviceCmds.push("  --device /dev/snd/pcmC0D0p:/dev/snd/pcmC0D0p \\");
//         deviceCmds.push("  --device /dev/snd/pcmC0D1c:/dev/snd/pcmC0D1c \\");
//         deviceCmds.push("  --device /dev/snd/pcmC0D1p:/dev/snd/pcmC0D1p \\");
//       }
//     }
//
//     // The commands for video device initialization require some user interaction
//     // Let's make sure we don't start downloading the image before user input might
//     // be required to prevent the script execution to be halted half-way due to user
//     // input being required.
//     imagePullCmds.forEach(function(cmd) { cmds.push(cmd); })
//
//     cmds.push("");
//     cmds.push("# Find a unique container name");
//     cmds.push("container_name='task-" + taskId + "-container'");
//     cmds.push("");
//     cmds.push("# Run docker command");
//     cmds.push("docker run -ti \\");
//     cmds.push("  --name \"${container_name}\" \\");
//     if (payload.capabilities && payload.capabilities.privileged) {
//       cmds.push("  --privileged \\");
//     }
//     _.keys(payload.env || {}).forEach(key => {
//       cmds.push("  -e " + key + "='" + payload.env[key] + "' \\");
//     });
//
//     // This allows changing behaviour on the script to be run to change
//     // behaviour from production (e.g. start VNC)
//     cmds.push("  -e RUN_LOCALLY='true' \\")
//
//     deviceCmds.forEach(function (cmd) { cmds.push(cmd); });
//     cmds.push("  ${image_name} \\");
//     if (payload.command) {
//       // We add a new line between 'docker run' and the command to ensure
//       // that the container won't execute it and end since we want to allow
//       // the developer to interact with it
//       cmds.push("");
//
//       var command = payload.command.map(cmd => {
//         cmd = cmd.replace(/\\/g, "\\\\");
//         if (/['\n\r\t\v\b]/.test(cmd)) {
//           return "'" + cmd.replace(/['\n\r\t\v\b]/g, c => {
//               return {
//                 "'":  "\\'",
//                 "\n": "\\n",
//                 "\r": "\\r",
//                 "\t": "\\t",
//                 "\v": "\\v",
//                 "\b": "\\b"
//               }[c];
//             }) + "'";
//         } else if (!/^[a-z-A-Z0-9\.,;://_-]*$/.test(cmd)) {
//           return "'" + cmd + "'";
//         }
//         return cmd;
//       }).join(' ');
//       cmds.push("  " + command + " \\");
//     }
//     cmds.push("");
//     if (payload.artifacts) {
//       cmds.push("# Extract Artifacts");
//       _.keys(payload.artifacts).forEach(name => {
//         var src = payload.artifacts[name].path;
//         var folder = name;
//         if (payload.artifacts[name].type === 'file') {
//           folder = path.dirname(name);
//         }
//         cmds.push("mkdir -p '" + folder + "'");
//         cmds.push("docker cp \"${container_name}:" + src + "\" '" + name + "'");
//       });
//       cmds.push("");
//     }
//     cmds.push("# Delete docker container");
//     cmds.push("docker rm -v \"${container_name}\"");
//     return cmds.join('\n');
//   }
// });
//
// // Export TaskInfo
// module.exports = TaskInfo;
