import R from 'ramda';
import { Updater, wrapAction } from 'redux-elm';
import { takeEvery, takeLatest } from 'redux-saga';
import { fork, call, put, select } from 'redux-saga/effects';
import init from './model';
import taskInfoUpdater, { LOAD_INFO } from '../TaskInfo/updater';

export const TASK_INFO = 'TASK_INFO';
export const RUN_INFO = 'RUN_INFO';
export const CHANGE_TAB = 'CHANGE_TAB';
export const LOAD_TASK_STATUS = 'LOAD_TASK_STATUS';
export const TASK_STATUS_LOADING = 'TASK_STATUS_LOADING';
export const TASK_STATUS_LOADED = 'TASK_STATUS_LOADED';

function* loadTaskStatus() {
  yield put({ type: TASK_STATUS_LOADING });

  const { taskcluster, taskId } = yield select();
  const { status } = yield call(() => taskcluster.queue.status(taskId));

  yield put({ type: TASK_STATUS_LOADED, payload: status });
}

function* updateTabs() {
  const model = yield select();
  const run = model.taskStatus.runs[model.currentTab];

  if (model.currentTab === '') {
    yield put(wrapAction({
      type: LOAD_INFO,
      payload: model.taskStatus
    }, TASK_INFO));
  } else if (run) {
    yield put(wrapAction({
      type: 'LOAD_RUN',
      payload: {
        taskStatus: model.taskStatus,
        run
      }
    }), RUN_INFO);
  }
}

function* listener() {
  yield [
    fork(takeLatest, LOAD_TASK_STATUS, loadTaskStatus),
    fork(takeEvery, TASK_STATUS_LOADED, updateTabs)
  ];
}

export default new Updater(init(), listener)
  .case(TASK_INFO, (model, action) => R.assoc('taskInfo', taskInfoUpdater(model.taskInfo, action), model))
  .case(RUN_INFO, (model, action) => R.assoc('runInfo', runInfoUpdater(model.runInfo, action), model))
  .case(LOAD_TASK_STATUS, (model, { payload }) => R.assoc('taskId', payload, model))
  .case(TASK_STATUS_LOADING, (model) => R.merge(model, {
    taskStatusLoading: true,
    taskStatusLoaded: false
  }))
  .case(TASK_STATUS_LOADED, (model, { payload }) => R.merge(model, {
    taskStatusLoading: false,
    taskStatusLoaded: true,
    taskStatus: payload
  }))
  .toReducer();
