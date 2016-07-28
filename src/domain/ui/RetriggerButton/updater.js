import R from 'ramda';
import { Updater } from 'redux-elm';
import { takeEvery } from 'redux-saga';
import { fork, call, select } from 'redux-saga/effects';
import { nice as slug } from 'slugid';
import { browserHistory } from 'react-router';
import init from './model';

export const CREATE_TASK = 'CREATE_TASK';

function* createTask() {
  const { task, taskcluster } = yield select();
  const taskId = slug();
  const now = Date.now();
  const created = Date.parse(task.created);
  const deadline = new Date(now + Date.parse(task.deadline) - created).toJSON();
  const expires = new Date(now + Date.parse(task.expires) - created).toJSON();

  yield call(() => taskcluster.queue.createTask(taskId, R.merge(task, {
    deadline,
    expires,
    created: new Date(now).toJSON(),
    retries: 0
  })));

  yield call(() => browserHistory.push(`/task-inspector/${taskId}`));
}

function* listener() {
  yield [
    fork(takeEvery, CREATE_TASK, createTask)
  ]
}

export default new Updater(init(), listener)
  .toReducer();
