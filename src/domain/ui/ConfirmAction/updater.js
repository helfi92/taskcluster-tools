import R from 'ramda';
import { Updater } from 'redux-elm';
import { takeEvery } from 'redux-saga';
import { call, select, put, fork } from 'redux-saga/effects';
import init from './model';

function* executeAction({ payload }) {
  yield put({ type: 'START_EXECUTING' });
  yield put({
    type: 'DONE_EXECUTING',
    payload: yield call(payload)
  });
}

function* listener() {
  yield [
    fork(takeEvery, 'EXECUTE_ACTION', executeAction)
  ];
}

export default new Updater(init(), listener)
  .case('SHOW_CONFIRM_ACTION', (model) => R.assoc('showDialog', true, model))
  .case('CLOSE_CONFIRM_ACTION', () => init())
  .case('START_EXECUTING', (model) => R.assoc('executing', true, model))
  .case('DONE_EXECUTING', (model, payload) => R.merge(model, { executing: false, result: payload }))
  .toReducer();
