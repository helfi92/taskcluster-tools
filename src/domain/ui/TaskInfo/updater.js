import R from 'ramda';
import { Updater } from 'redux-elm';
import { takeEvery } from 'redux-saga';
import { fork, put, call, select } from 'redux-saga/effects';
import init, { taskStatusStateLabel, purgeCacheModel, retriggerModel } from './model';
import retriggerButtonUpdater from '../RetriggerButton/updater';
import purgeCacheButtonUpdater from '../PurgeCacheButton/updater';

/**
 * isResolved :: a -> Boolean
 */
// const isResolved = R.contains(R.__, ['completed', 'failed', 'exception']);

export const LOAD_INFO = 'LOAD_INFO';
export const UPDATE_TASK = 'UPDATE_TASK';
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
    put({ type: RETRIGGER_BUTTON }),
    put({ type: PURGE_CACHE_BUTTON })
  ]
}

function* listener() {
  yield [
    fork(takeEvery, LOAD_INFO, load)
  ];
  // yield* takeEvery('QUEUE_SCHEDULE_TASK', queueScheduleTask);
}

export default new Updater(init(), listener)
  .case(RETRIGGER_BUTTON, (model, action) => R.assoc('retriggerButton',
    retriggerButtonUpdater(retriggerModel(model), action),
    model))
  .case(PURGE_CACHE_BUTTON, (model, action) => R.assoc('purgeCacheButton',
    purgeCacheButtonUpdater(purgeCacheModel(model), action),
    model))
  .case(LOAD_INFO, (model, { payload }) => R.merge(model, {
    taskStatus: payload,
    taskLoaded: false,
    taskLoading: true
  }, model))
  .case(UPDATE_TASK, (model, { payload }) => R.merge(model, {
    label: taskStatusStateLabel[model.taskStatus.state],
    task: payload,
    taskLoaded: true,
    taskLoading: false
  }))
  .toReducer();