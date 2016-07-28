import R from 'ramda';
import { Updater } from 'redux-elm';
import { takeEvery } from 'redux-saga';
import { fork, call, put, select } from 'redux-saga/effects';
import init from './model';
import confirmActionUpdater from '../ConfirmAction/updater';

export const PURGE = 'PURGE';
export const UPDATE = 'UPDATE';
export const CONFIRM_ACTION = 'CONFIRM_ACTION';
const UPDATE_SELECTED = 'UPDATE_SELECTED';

/**
 * notEquals :: a -> b -> Boolean
 */
const notEquals = R.complement(R.equals);

function* purge() {
  const { selected, provisionerId, workerType, taskcluster } = yield select();
  const purgeItem = (cacheName) => taskcluster.purgeCache.purgeCache(provisionerId, workerType, { cacheName });

  yield call(() => Promise.all(R.map(purgeItem, selected)));
}

function* update({ payload }) {
  const { selected } = yield select();
  const { isChecked, value } = payload;

  yield put({
    type: UPDATE_SELECTED,
    payload: isChecked ?
      R.append(value, selected) :
      R.filter(notEquals(value), selected)
  });
}

function* listener() {
  yield [
    fork(takeEvery, PURGE, purge),
    fork(takeEvery, UPDATE, update)
  ]
}

export default new Updater(init(), listener)
  .case(CONFIRM_ACTION, (model, action) => R.assoc('confirmAction',
    confirmActionUpdater(model.confirmAction, action),
    model))
  .case(UPDATE_SELECTED, (model, { payload }) => R.assoc('selected', payload, model))
  .toReducer();
