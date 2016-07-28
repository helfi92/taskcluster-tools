import R from 'ramda';
import { Updater, wrapAction } from 'redux-elm';
import { takeLatest } from 'redux-saga';
import { call, put, fork, select } from 'redux-saga/effects';
import { browserHistory } from 'react-router';
import init from './model';
import taskViewUpdater, { LOAD_TASK_STATUS } from '../../ui/TaskView/updater';

export const TASK_ID_CHANGE = 'TASK_ID_CHANGE';
export const TASK_INSPECTOR_SUBMIT = 'TASK_INSPECTOR_SUBMIT';
const NAVIGATE_TO_TASK = 'NAVIGATE_TO_TASK';
const TASK_VIEW = 'TASK_VIEW';

/**
 * getTaskId :: Object -> String | Undefined
 */
const getTaskId = R.prop('taskId');

function* loadTaskView() {
  const taskId = yield select(getTaskId);

  if (!taskId) {
    return;
  }

  yield put(wrapAction({ type: LOAD_TASK_STATUS, payload: taskId }, TASK_VIEW));
}

function* updateTaskView() {
  yield call(loadTaskView);
  yield put({ type: NAVIGATE_TO_TASK });
}

function* navigateToTask() {
  const taskId = yield select(getTaskId);

  yield call(() => browserHistory.push(`/task-inspector/${taskId || ''}`));
}

function* listener() {
 yield [
   fork(takeLatest, TASK_INSPECTOR_SUBMIT, updateTaskView),
   fork(takeLatest, NAVIGATE_TO_TASK, navigateToTask)
 ];

  yield loadTaskView();
}

export default new Updater(init({}), listener)
  .case(TASK_VIEW, (model, action) => R.assoc('taskView', taskViewUpdater(model.taskView, action), model))
  .case(TASK_ID_CHANGE, (model, action) => R.assoc('taskId', action.payload.trim(), model))
  .case(TASK_INSPECTOR_SUBMIT, (model, { payload }) => R.merge(model, payload))
  .toReducer();
