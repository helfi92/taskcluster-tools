import R from 'ramda';
import { put } from 'redux-saga/effects';
import confirm, { init as initConfirm } from '../ConfirmAction/model';
import retriggerButton from '../RetriggerButton/model';
import purgeCacheButton from '../PurgeCacheButton/model';

export const taskStatusStateLabel = {
  unscheduled: 'label label-default',
  pending: 'label label-info',
  running: 'label label-primary',
  completed: 'label label-success',
  failed: 'label label-danger',
  exception: 'label label-warning'
};

/**
 * isResolved :: a -> Boolean
 */
// const isResolved = R.contains(R.__, ['completed', 'failed', 'exception']);


// buttonSize="xsmall"
//                        buttonStyle="primary"
//                        disabled={status.state !== 'unscheduled'}
//                        glyph="play"
//                        label="Schedule Task"
//                        action={this.scheduleTask}
//                        success="Successfully scheduled task!"

/**
 * purgeCacheModel :: Object -> Object
 */
export const purgeCacheModel = (model) => ({
  taskcluster: model.taskcluster,
  caches: R.keys(R.pathOr({}, ['task', 'payload', 'cache'], model)),
  provisionerId: R.path(['task', 'provisionerId'], model),
  workerType: R.path(['task', 'workerType'], model)
});

/**
 * retriggerModel :: Object -> Object
 */
export const retriggerModel = R.pick(['taskcluster', 'task']);

export default (model = {}) => {
  return R.merge({
    taskcluster: null,
    taskStatus: null,
    taskLoading: false,
    taskLoaded: false,
    task: null,
    label: taskStatusStateLabel.unscheduled,
    retriggerButton: retriggerButton(retriggerModel(model)),
    purgeCacheButton: purgeCacheButton(purgeCacheModel(model))
  }, model);

  // return {
  //   task: null,
  //   taskLoaded: false,
  //   label: taskStateLabel.unscheduled,
  //   status: { state: 'unscheduled' },
  //   confirmScheduleTask: initConfirm({
  //     buttonSize: 'xsmall',
  //     buttonStyle: 'primary',
  //     disabled: true,
  //     glyph: 'play',
  //     label: 'Schedule Task',
  //     success: 'Successfully scheduled task!',
  //     action: function*() {
  //       yield put({ type: 'QUEUE_SCHEDULE_TASK', payload: model.status.taskId });
  //     }// { type: 'QUEUE_SCHEDULE_TASK', payload: model.status.taskId },
  //   })
  // };
};