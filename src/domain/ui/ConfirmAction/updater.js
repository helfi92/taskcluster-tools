import R from 'ramda';
import { Updater } from 'redux-elm';
import { takeEvery } from 'redux-saga';
import { call, select, put, fork } from 'redux-saga/effects';
import init from './model';

/**
 * getAction :: Object -> Function
 */
const getAction = R.prop('action');

function* executeAction() {
  yield put({ type: 'START_EXECUTING' });

  const action = yield select(getAction);
  const payload = yield call(action);

  yield put({ type: 'DONE_EXECUTING', payload });
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
