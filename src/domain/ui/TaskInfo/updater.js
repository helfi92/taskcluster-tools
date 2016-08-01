import R from 'ramda';
import { Updater, wrapAction } from 'redux-elm';
import { takeEvery } from 'redux-saga';
import { fork, put, call, select } from 'redux-saga/effects';
import init, { taskStatusStateLabel } from './model';
import confirmActionUpdater from '../ConfirmAction/updater';
import retriggerButtonUpdater from '../RetriggerButton/updater';
import purgeCacheButtonUpdater from '../PurgeCacheButton/updater';

/**
 * isResolved :: a -> Boolean
 */
// const isResolved = R.contains(R.__, ['completed', 'failed', 'exception']);

export const LOAD_INFO = 'LOAD_INFO';
export const UPDATE_TASK = 'UPDATE_TASK';
export const TASK_UPDATE = 'TASK_UPDATE';
export const SCHEDULE_TASK = 'SCHEDULE_TASK';
export const CANCEL_TASK = 'CANCEL_TASK';
export const RETRIGGER_BUTTON = 'TASK_INFO_RETRIGGER_BUTTON';
export const PURGE_CACHE_BUTTON = 'TASK_INFO_PURGE_CACHE_BUTTON';
export const CONFIRM_SCHEDULE_TASK = 'TASK_INFO_CONFIRM_SCHEDULE_TASK';
export const CONFIRM_CANCEL_TASK = 'TASK_INFO_CONFIRM_CANCEL_TASK';

function* queueScheduleTask() {

}

function* load() {
  const { taskcluster, taskStatus } = yield select();
  const task = yield call(() => taskcluster.queue.task(taskStatus.taskId));

  yield put({
    type: UPDATE_TASK,
    payload: task
  });

  yield [
    put({ type: CONFIRM_SCHEDULE_TASK }),
    put({ type: CONFIRM_CANCEL_TASK }),
    put(wrapAction({ type: TASK_UPDATE, payload: task }, RETRIGGER_BUTTON)),
    put(wrapAction({ type: TASK_UPDATE, payload: task }, PURGE_CACHE_BUTTON))
  ]
}

function* listener() {
  yield [
    fork(takeEvery, LOAD_INFO, load)
  ];
  // yield* takeEvery('QUEUE_SCHEDULE_TASK', queueScheduleTask);
}

export default new Updater(init(), listener)
  .case(CONFIRM_SCHEDULE_TASK, (model, action) => R.assoc('confirmScheduleTask',
    confirmActionUpdater(model.confirmScheduleTask, action), model))
  .case(CONFIRM_CANCEL_TASK, (model, action) => R.assoc('confirmCancelTask',
    confirmActionUpdater(model.confirmCancelTask, action), model))
  .case(RETRIGGER_BUTTON, (model, action) => R.assoc('retriggerButton',
    retriggerButtonUpdater(model.retriggerButton, action), model))
  .case(PURGE_CACHE_BUTTON, (model, action) => R.assoc('purgeCacheButton',
    purgeCacheButtonUpdater(model.purgeCacheButton, action), model))
  .case(LOAD_INFO, (model, { payload }) => R.merge(model, {
    taskStatus: payload,
    taskLoaded: false,
    taskLoading: true
  }))
  .case(UPDATE_TASK, (model, { payload }) => R.merge(model, {
    label: taskStatusStateLabel[model.taskStatus.state],
    task: payload,
    taskLoaded: true,
    taskLoading: false
  }))
  .toReducer();