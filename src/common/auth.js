import R from 'ramda';
import { IO, Maybe } from 'ramda-fantasy';
import { eventChannel } from 'redux-saga';
import { format } from 'url';

const EXPIRY_WARNING =  5 * 60 * 1000;
let credentialsExpiredTimeout;

/**
 * getExpirationTimeout :: IO Number -> Number
 */
export const getExpirationTimeout = IO((expiry) => IO
  .of(-Date.now())
  .map(R.add(expiry))
  .map(R.subtract(EXPIRY_WARNING))
  .map(R.add(500))
  .runIO());

/**
 * isExpired :: IO Number -> Boolean
 */
export const isExpired = IO((expiry) => {
  const expirationLimit = IO
    .of(Date.now())
    .map(R.add(EXPIRY_WARNING))
    .runIO();

  return R.lt(expiry, expirationLimit);
});

/**
 * saveCredentials :: IO Object -> ()
 */
export const saveCredentials = IO((credentials) => {
  localStorage.setItem('credentials', JSON.stringify(credentials));
});

/**
 * deleteCredentials :: IO () -> ()
 */
export const deleteCredentials = IO(() => {
  localStorage.removeItem('credentials');
});

/**
 * loadCredentials :: IO () -> Maybe Object
 */
export const loadCredentials = IO(() => {
  const rawCredentials = localStorage.getItem('credentials');

  if (!rawCredentials) {
    return Maybe.Nothing();
  }

  try {
    const credentials = JSON.parse(rawCredentials);

    if (credentials.certificate && credentials.certificate.expiry < Date.now()) {
      deleteCredentials.runIO();
      return Maybe.Nothing();
    } else if (credentials.certificate) {
      clearTimeout(credentialsExpiredTimeout);
      credentialsExpiredTimeout = setTimeout(
        deleteCredentials,
        credentials.certificate.expiry - Date.now()
      );
    } else {
      clearTimeout(credentialsExpiredTimeout);
      credentialsExpiredTimeout = null;
    }

    return Maybe.Just(credentials);
  } catch (err) {
    console.log('Failed to parse credentials, err:', err, err.stack);
    return Maybe.Nothing();
  }
});

/**
 * IO storageChannel :: () -> EventChannel
 */
export const storageChannel = R.memoize(() => {
  return eventChannel((emit) => {
    window.addEventListener('storage', (e) => {
      if (e.key !== 'credentials') {
        return;
      }

      if (!e.newValue) {
        return emit({ credentials: null });
      }

      try {
        let credentials = JSON.parse(e.newValue);

        emit({ credentials });
      } catch (err) {
        console.log('Failed to parse credentials, err:', err, err.stack);
        emit({ credentials: null });
      }
    }, false);
  });
});

/**
 * buildLoginUrl :: IO () -> String
 */
const buildLoginUrl = IO(() => {
  return format({
    protocol: 'https',
    host: 'login.taskcluster.net',
    query: {
      target: format({
        protocol: location.protocol,
        host: location.host,
        pathname: '/login'
      }),
      description: 'TaskCluster Tools offers various ways to create and inspect both tasks and task graphs.'
    }
  });
});

/**
 * openLogin :: IO () -> ()
 */
export const openLogin = IO(() => window.open(buildLoginUrl.runIO(), '_blank'));

/**
 * openLogin :: IO () -> ()
 */
export const redirectToLogin = IO(() => location = buildLoginUrl.runIO());
