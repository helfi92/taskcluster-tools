import R from 'ramda';
import { IO } from 'ramda-fantasy';
import { browserHistory } from 'react-router';
import { parse } from 'querystring';
import * as auth from '../../../common/auth';

/**
 * handleCredentials :: IO () -> ()
 */
export const handleCredentials = IO(() => {
  const credentials = parse(location.search.substr(1));

  if (!R.isEmpty(credentials)) {
    auth
      .saveCredentials
      .runIO(R.is(String, credentials.certificate) ?
        R.evolve({ certificate: JSON.parse }, credentials) :
        credentials
      );
  }

  window.opener ?
    window.close() :
    browserHistory.push('/');
});
