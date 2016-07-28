import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import routing from '../common/routing';

const NOOP = () => null;
export const instrument = NOOP;
export const persist = NOOP;

export default ({ store, history, dispatch }) => (
  <Provider store={store}>
    <Router history={history} routes={routing(dispatch)} />
  </Provider>
);
