import R from 'ramda';
import React from 'react';
import { view, forwardTo } from 'redux-elm';
import { TASK_ID_CHANGE, TASK_INSPECTOR_SUBMIT } from './updater';
import { Row, Col, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import { Button } from '../../ui/Bootstrap';
import Form from '../../ui/form';
import TaskView from '../../ui/TaskView';

import "./index.scss";

export const title = 'Task Inspector';
export const path = 'task-inspector(/:taskId)';
export const icon = 'cube';
export const description = `The task inspector lets you load, monitor, and inspect the state, runs, artifacts,
  definition, and logs of a task as it is evaluated. You can also use this tool download private artifacts.`;

export default view(({ model, dispatch }) => {
  const submit = (e, values) => dispatch({ type: TASK_INSPECTOR_SUBMIT, payload: values });
  const change = (e) => dispatch({ type: TASK_ID_CHANGE, payload: e.target.value });

  return (
    <Row className="inspector">
      <Col md={10} mdOffset={1}>
        <h1>Task Inspector</h1>
        <p>This tools lets you inspect a task given the <code>taskId</code></p>
        <Form horizontal onSubmit={submit}>
          <Row>
            <Col sm={8}>
              <FormGroup>
                <ControlLabel className="col-sm-2">
                  <span>Enter <code>taskId</code></span>
                </ControlLabel>
                <Col sm={10}>
                  <FormControl
                    type="text"
                    name="taskId"
                    value={model.taskId}
                    onChange={change}
                    placeholder="taskId"
                    pattern="^[A-Za-z0-9_-]{8}[Q-T][A-Za-z0-9_-][CGKOSWaeimquy26-][A-Za-z0-9_-]{10}[AQgw]$"
                    hasFeedback />
                </Col>
              </FormGroup>

              <FormGroup>
                <Col smOffset={2} sm={10}>
                  <Button type="submit" bsStyle="primary">
                    Inspect task
                  </Button>
                </Col>
              </FormGroup>
            </Col>

            <Col sm={4}>
              Previous tasks goes here...
            </Col>
          </Row>
        </Form>

        <TaskView model={model.taskView} dispatch={forwardTo(dispatch, 'TASK_VIEW')} />
      </Col>
    </Row>
  );

  // Render
//     var .test(this.state.taskIdInput);
//     return (
//       <span>
//       <h1>Task Inspector</h1>
//       <p>This tool lets you inspect a task given the <code>taskId</code></p>
//       <form className="form-horizontal" onSubmit={this.handleSubmit}>
//         <div className="row">
//           <div className="col-sm-8">
//             <bs.Input
//               type="text"
//               ref="taskId"
//               placeholder="taskId"
//               value={this.state.taskIdInput}
//               label={<span>Enter <code>TaskId</code></span>}
//               bsStyle={invalidInput ? 'error' : null}
//               onChange={this.handleTaskIdInputChange}
//               hasFeedback
//               labelClassName="col-sm-2"
//               wrapperClassName="col-sm-10"/>
//
//             <div className="form-group">
//               <div className="col-sm-offset-2 col-sm-10">
//                 <input type="submit"
//                        className="btn btn-primary"
//                        disabled={!this.state.statusLoaded || invalidInput}
//                        value="Inspect task"/>
//               </div>
//             </div>
//           </div>
//
//           <div className="col-sm-4">
//             <PreviousTasks objectId={this.state.taskId} objectType="taskId"/>
//           </div>
//         </div>
//       </form>
//         {
//           this.renderWaitFor('status') || (this.state.status ? (
//             <TaskView
//               ref="taskView"
//               status={this.state.status}
//               hashEntry={this.nextHashEntry()}/>
//           ) : (
//             undefined
//           ))
//         }
//       </span>
//     );




});


//
// var utils           = require('../lib/utils');
// var taskcluster     = require('taskcluster-client');
// var TaskView        = require('../lib/ui/taskview');
// var PreviousTasks   = require('../lib/ui/previoustasks');
//
//
// /** Renders the task-inspector with a control to enter `taskId` into */
// var TaskInspector = React.createClass({
//   mixins: [
//     // Calls load() initially and on reload()
//     utils.createTaskClusterMixin({
//       // Need updated clients for Queue and QueueEvents
//       clients: {
//         queue:                taskcluster.Queue,
//         queueEvents:          taskcluster.QueueEvents
//       },
//       // Reload when state.taskId changes, ignore credential changes
//       reloadOnKeys:           ['taskId'],
//       reloadOnLogin:          false
//     }),
//     // Called handler when state.taskId changes
//     utils.createWatchStateMixin({
//       onKeys: {
//         updateTaskIdInput:    ['taskId']
//       }
//     }),
//     // Listen for messages, reload bindings() when state.taskId changes
//     utils.createWebListenerMixin({
//       reloadOnKeys:           ['taskId']
//     }),
//     // Serialize state.taskId to location.hash as string
//     utils.createLocationHashMixin({
//       keys:                   ['taskId'],
//       type:                   'string'
//     })
//   ],
//
//   getInitialState() {
//     return {
//       taskId:         '',
//       statusLoaded:   true,
//       statusError:    undefined,
//       status:         null,
//       taskIdInput:    ''
//     };
//   },
//
//   /** Return promised state for TaskClusterMixin */
//   load() {
//     // Skip loading empty-strings
//     if (this.state.taskId === '') {
//       return {
//         status:         null
//       };
//     }
//     // Reload status structure
//     return {
//       // Load task status and take the `status` key from the response
//       status:     this.queue.status(this.state.taskId)
//         .then(_.property('status'))
//     };
//   },
//
//   /** Return bindings for WebListenerMixin */
//   bindings() {
//     // Don't bother listening for empty strings, they're pretty boring
//     if (this.state.taskId === '') {
//       return [];
//     }
//     // Construct the routing key pattern
//     var routingKey = {
//       taskId:     this.state.taskId
//     };
//     // Return all interesting bindings
//     return [
//       this.queueEvents.taskDefined(routingKey),
//       this.queueEvents.taskPending(routingKey),
//       this.queueEvents.taskRunning(routingKey),
//       this.queueEvents.artifactCreated(routingKey),
//       this.queueEvents.taskCompleted(routingKey),
//       this.queueEvents.taskFailed(routingKey),
//       this.queueEvents.taskException(routingKey)
//     ];
//   },
//
//   /** Handle message from listener */
//   handleMessage(message) {
//     // Update status structure
//     this.setState({
//       status:           message.payload.status
//     });
//
//     // If the message origins from the artifact create exchange, we should
//     // notify our children
//     if (message.exchange === this.queueEvents.artifactCreated().exchange) {
//       if (this.refs.taskView) {
//         this.refs.taskView.handleArtifactCreatedMessage(message);
//       }
//     }
//   },
//
//   /** When taskId changed we should update the input */
//   updateTaskIdInput() {
//     this.setState({taskIdInput: this.state.taskId});
//   },
//
//   // Render a task-inspector
//   render() {
//     // Render
//     var invalidInput = !/^[A-Za-z0-9_-]{8}[Q-T][A-Za-z0-9_-][CGKOSWaeimquy26-][A-Za-z0-9_-]{10}[AQgw]$/.test(this.state.taskIdInput);
//     return (
//       <span>
//       <h1>Task Inspector</h1>
//       <p>This tool lets you inspect a task given the <code>taskId</code></p>
//       <form className="form-horizontal" onSubmit={this.handleSubmit}>
//         <div className="row">
//           <div className="col-sm-8">
//             <bs.Input
//               type="text"
//               ref="taskId"
//               placeholder="taskId"
//               value={this.state.taskIdInput}
//               label={<span>Enter <code>TaskId</code></span>}
//               bsStyle={invalidInput ? 'error' : null}
//               onChange={this.handleTaskIdInputChange}
//               hasFeedback
//               labelClassName="col-sm-2"
//               wrapperClassName="col-sm-10"/>
//
//             <div className="form-group">
//               <div className="col-sm-offset-2 col-sm-10">
//                 <input type="submit"
//                        className="btn btn-primary"
//                        disabled={!this.state.statusLoaded || invalidInput}
//                        value="Inspect task"/>
//               </div>
//             </div>
//           </div>
//
//           <div className="col-sm-4">
//             <PreviousTasks objectId={this.state.taskId} objectType="taskId"/>
//           </div>
//         </div>
//       </form>
//         {
//           this.renderWaitFor('status') || (this.state.status ? (
//             <TaskView
//               ref="taskView"
//               status={this.state.status}
//               hashEntry={this.nextHashEntry()}/>
//           ) : (
//             undefined
//           ))
//         }
//       </span>
//     );
//   },
//
//   /** Update TaskIdInput to reflect input */
//   handleTaskIdInputChange() {
//     this.setState({
//       taskIdInput:      this.refs.taskId.getInputDOMNode().value.trim()
//     });
//   },
//
//   /** Handle form submission */
//   handleSubmit(e) {
//     e.preventDefault();
//     this.setState({taskId: this.state.taskIdInput});
//   }
// });
//
// // Export TaskInspector
// module.exports = TaskInspector;
