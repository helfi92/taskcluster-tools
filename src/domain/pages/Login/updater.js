import { Updater } from 'redux-elm';
import { call } from 'redux-saga/effects';
import * as IO from './io';

const initialModel = {};

function* listen() {
  yield call(() => IO.handleCredentials.runIO());
}

export default new Updater(initialModel, listen).toReducer();
