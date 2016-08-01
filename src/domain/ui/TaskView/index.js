import R from 'ramda';
import React from 'react';
import { view, forwardTo } from 'redux-elm';
import { Nav, NavDropdown, Alert } from 'react-bootstrap';
import { NavItem, MenuItem } from '../Bootstrap';
import Spinner from '../Spinner';
import TaskInfo from '../TaskInfo';
import { TASK_INFO, RUN_INFO, CHANGE_TAB } from './updater';

import './index.scss';

export default view(({ model, dispatch }) => {
  if (model.taskStatusLoading) {
    return <div className="task-view"><Spinner /></div>;
  }

  if (!model.taskStatusLoaded) {
    return <div className="task-view"></div>;
  }

  const { taskStatus, currentTab } = model;
  const changeTab = (e) => {
    dispatch({ type: CHANGE_TAB, value: null });
  };
  const [initialRuns, extraRuns] = R.splitAt(6, taskStatus.runs);

  return (
    <div className="task-view">
      <Nav bsStyle="tabs" activeKey={currentTab} onSelect={changeTab}>
        <NavItem eventKey={''} key={''}>Task</NavItem>

        {R.map(({ runId }) => (
          <NavItem eventKey={`${runId}`} key={`${runId}`}>Run {runId}</NavItem>
        ), initialRuns)}

        {(() => {
          if (extraRuns.length) {
            return (
              <NavDropdown id="more-runs-dropdown" eventKey="extra" title="More Runs" key="extra" navItem={true}>
                {R.map(({ runId }) => (
                  <MenuItem eventKey={`${runId}`} key={`${runId}`}>Run {runId}</MenuItem>
                ), extraRuns)}
              </NavDropdown>
            );
          }
        })()}
      </Nav>

      <div className="tab-content">
        <div className="tab-pane active">
          {(() => {
            // Empty string is the task tab, but zero is a possible value
            if (currentTab === '') {
              return <TaskInfo model={model.taskInfo} dispatch={forwardTo(dispatch, TASK_INFO)} />;
            }

            const run = taskStatus.runs[currentTab];

            if (run) {
              return <RunInfo model={model.runInfo} dispatch={forwardTo(dispatch, RUN_INFO)} />;
            }

            return (
              <Alert bsStyle="danger">
                <strong>Run Not Found!</strong> The task does not seem to have the requested run.
              </Alert>
            );
          })()}
        </div>
      </div>
    </div>
  );
});

// var React           = require('react');
// var bs              = require('react-bootstrap');
// var utils           = require('../utils');
// var format          = require('../format');
// var _               = require('lodash');
// var TaskInfo        = require('./taskinfo');
// var RunInfo         = require('./runinfo');

// /** Takes a task status structure and renders tabs for taskInfo and runInfo */
// var TaskView = React.createClass({
//   mixins: [
//     // Serialize state.currentTab to location.hash as string
//     utils.createLocationHashMixin({
//       keys:                   ['currentTab'],
//       type:                   'string'
//     })
//   ],
//
//   // Get initial state
//   getInitialState: function() {
//     return {
//       currentTab:   this.props.initialTab   // Empty string is the task view
//     };
//   },
//
//   // Create default properties
//   getDefaultProps: function() {
//     return {
//       initialTab:   '',   // Initial tab to show (empty string is task view)
//     };
//   },
//
//   // Validate properties
//   propTypes: {
//     status:         React.PropTypes.object.isRequired,
//   },
//
//   // Render tabs and current tab
//   render: function() {
//     let initialRuns = this.props.status.runs.slice(0, 6);
//     let extraRuns = this.props.status.runs.slice(6);
//
//     return (
//       <div className="task-view">
//         <bs.Nav bsStyle="tabs" activeKey={`${this.state.currentTab}`} onSelect={this.setCurrentTab}>
//           <bs.NavItem eventKey={''} key={''}>Task</bs.NavItem>
//           {initialRuns.map(({ runId }) => <bs.NavItem eventKey={`${runId}`} key={`${runId}`}>Run {runId}</bs.NavItem>)}
//           {extraRuns.length ?
//             <bs.NavDropdown
//               id="more-runs-dropdown"
//               eventKey="extra"
//               title="More Runs"
//               key="extra"
//               navItem={true}>
//               {extraRuns.map(({ runId }) => <bs.MenuItem eventKey={`${runId}`} key={`${runId}`}>Run {runId}</bs.MenuItem>)}
//             </bs.NavDropdown> :
//             null
//           }
//         </bs.Nav>
//         <div className="tab-content">
//           <div className="tab-pane active">
//             {this.renderCurrentTab()}
//           </div>
//         </div>
//       </div>
//     );
//   },
//
//   /** Render current tab */
//   renderCurrentTab: function() {
//     // Empty string is the task tab, but zero is a possible value
//     if (this.state.currentTab === '') {
//       return <TaskInfo status={this.props.status} />;
//     }
//     // Check if we have the run in current tab
//     let run = this.props.status.runs[this.state.currentTab];
//
//     if (!run) {
//       return (
//         <div className="alert alert-danger">
//           <strong>Run Not Found!</strong>&nbsp;
//           The task does not seem to have the requested run.
//         </div>
//       );
//     }
//
//     // return a RunInfo
//     return (
//       <RunInfo
//         status={this.props.status}
//         run={run}
//         ref="runInfo" />
//     );
//   },
//
//   // Set currentTab
//   setCurrentTab: function(tab) {
//     // Update state
//     this.setState({
//       currentTab: tab
//     });
//   },
//
//   // Tell child that we got an artifact created message
//   handleArtifactCreatedMessage: function(message) {
//     if (this.refs.runInfo) {
//       this.refs.runInfo.handleArtifactCreatedMessage(message);
//     }
//   }
// });
//
// // Export TaskView
// module.exports = TaskView;
