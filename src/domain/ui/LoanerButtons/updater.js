import R from 'ramda';
import { Updater } from 'redux-elm';
import { takeEvery } from 'redux-saga';
import { fork, call, select } from 'redux-saga/effects';
import { browserHistory } from 'react-router';
import slugid from 'slugid';
import { fromNowJSON } from 'taskcluster-client';
import init from './model';
import confirmActionUpdater from '../ConfirmAction/updater';

export const CREATE_TASK = 'CREATE_TASK';
export const EDIT_TASK = 'CREATE_TASK';
export const CONFIRM_ACTION = 'CONFIRM_ACTION';
const TASK_UPDATE = 'TASK_UPDATE';

/**
 * nil :: a -> Undefined
 */
const nil = R.always(undefined);

const cloneTask = R.evolve({
  created: R.always(fromNowJSON()),
  deadline: R.always(fromNowJSON('12 hours')),
  dependencies: nil,
  expires: R.always(fromNowJSON('7 days')),
  payload: {
    artifacts: nil,
    caches: nil,
    env: {
      TASKCLUSTER_INTERACTIVE: R.T
    },
    features: {
      interactive: R.T
    },
    maxRunTime: R.max(3 * 60 * 60)
  },
  requires: nil,
  retries: R.always(0),
  routes: nil,
});

function* createTask() {
  const taskId = slugid.nice();
  const { task, taskcluster } = yield select();
  const newTask = cloneTask(task);

  yield call(() => taskcluster.queue.createTask(taskId, newTask));
  yield call(() => browserHistory.push(`/one-click-loaner/connect/${taskId}`));
}

function* editTask() {
  const { task } = yield select();
  const newTask = cloneTask(task);

  yield call(() => localStorage.setItem('task-creator/task', JSON.stringify(newTask)));
  yield call(() => browserHistory.push('/task-creator'));
}

function* listener() {
  yield [
    fork(takeEvery, CREATE_TASK, createTask),
    fork(takeEvery, EDIT_TASK, editTask)
  ]
}

export default new Updater(init(), listener)
  .case(CONFIRM_ACTION, (model, action) => R.assoc('confirmAction',
    confirmActionUpdater(model.confirmAction, action),
    model))
  .case(TASK_UPDATE, (model, { payload }) => R.assoc('task', payload, model))
  .toReducer();
