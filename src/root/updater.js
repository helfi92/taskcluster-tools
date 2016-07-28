import R from 'ramda';
import { Updater, wrapAction } from 'redux-elm';
import { takeEvery, takeLatest } from 'redux-saga';
import { take, call, fork, put, select } from 'redux-saga/effects';
import { URL_CHANGE } from '../common/routing';
import * as auth from '../common/auth';
import { createClients } from '../common/clients';
import icons from '../common/icons';
import initialModel from './model';
import injectPageActions from './page-actions';

const AUTHORIZED = 'AUTHORIZED';
const REVOKED = 'REVOKED';
const CREDENTIALS_LOADED = 'CREDENTIALS_LOADED';
const HIDE_CREDENTIALS_MESSAGE = 'HIDE_CREDENTIALS_MESSAGE';
const SIGN_IN = 'SIGN_IN';
const SIGN_OUT = 'SIGN_OUT';
const SHOW_EXPIRATION_WARNING = 'SHOW_EXPIRATION_WARNING';

/**
 * hasExpiration :: Object -> Boolean
 */
const hasExpiration = R.pathSatisfies(R.is(Number), ['certificate', 'expiry']);

function* loadCredentials() {
  const credentials = yield call(() => auth.loadCredentials.runIO().getOrElse());

  if (credentials) {
    yield put({
      type: CREDENTIALS_LOADED,
      payload: { credentials }
    });
  }
}

function* expirationFlow() {
  let expirationTimer = null;

  while (true) {
    const { credentials } = yield take(CREDENTIALS_LOADED);

    if (!R.isNil(expirationTimer)) {
      clearTimeout(expirationTimer);
      expirationTimer = null;
    }

    // We only support monitoring expiration of temporary credentials. Anything
    // else requires hitting the Auth API, and temporary credentials are the
    // common case.

    if (!hasExpiration(credentials)) {
      continue;
    }

    const { expiry } = credentials.certificate;
    const isExpired = auth.isExpired.runIO(expiry);

    if (isExpired) {
      yield put({ type: SHOW_EXPIRATION_WARNING });
      continue;
    }

    const timeout = auth.getExpirationTimeout.runIO(expiry);

    expirationTimer = setTimeout(function*() {
      yield put({ type: SHOW_EXPIRATION_WARNING });
    }, timeout);
  }
}

function* storageFlow() {
  const channel = yield call(auth.storageChannel);

  while (true) {
    const payload = yield take(channel);

    if (payload.credentials) {
      yield put({ type: CREDENTIALS_LOADED, payload });
    } else {
      yield put({ type: REVOKED });
    }
  }
}

function* signIn() {
  yield* takeLatest(SIGN_IN, function*() {
    yield call(() => auth.openLogin.runIO());
    yield take(CREDENTIALS_LOADED);
    yield put({ type: AUTHORIZED });
  });
}

function* signOut() {
  yield* takeEvery(SIGN_OUT, function*() {
    yield call(() => auth.deleteCredentials.runIO());
    yield put({ type: REVOKED });
  });
}

function* viewUpdater() {
  yield* takeEvery([CREDENTIALS_LOADED, REVOKED], function*(action) {
    const { taskcluster, currentPage } = yield select();

    yield put(wrapAction({
      type: action.type,
      payload: { taskcluster }
    }, currentPage.actionKey));
  });
}

function* listener() {
  yield [
    fork(signIn),
    fork(signOut),
    fork(expirationFlow),
    fork(storageFlow),
    fork(viewUpdater)
  ];

  yield loadCredentials();
}

export default injectPageActions(new Updater(initialModel, listener))
  .case(URL_CHANGE, (model, { payload }) => {
    const { route, nextState } = payload;

    return R.merge(model, {
      params: nextState.params,
      currentPage: route,
      shortcutIcon: icons[route.icon]
    });
  })
  .case(AUTHORIZED, (model) => R.merge(model, {
    credentialsMessage: {
      title: 'Signed In',
      body: `You are now signed in as ${model.credentials.clientId}`
    }
  }))
  .case(REVOKED, (model) => R.merge(model, {
    taskcluster: createClients(),
    credentials: null,
    credentialsExpiringSoon: false,
    credentialsMessage: {
      title: 'Signed Out',
      body: 'You are now signed out.'
    }
  }))
  .case(CREDENTIALS_LOADED, (model, { payload }) => R.merge(model, {
    taskcluster: createClients(payload.credentials),
    credentials: payload.credentials,
    credentialsExpiringSoon: false
  }))
  .case(SHOW_EXPIRATION_WARNING, (model) => R.merge(model, {
    credentialsExpiringSoon: true,
    credentialsMessage: {
      title: 'Expiring Soon',
      body: `Your temporary credentials will expire soon. Sign in again to refresh them.`
    }
  }))
  .case(HIDE_CREDENTIALS_MESSAGE, R.assoc('credentialsMessage', null))
  .toReducer();
