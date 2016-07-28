import React from 'react';
import { render } from 'react-dom';
import refractal from 'redux-elm';
import { combineReducers, compose, createStore as _createStore } from 'redux';
import { browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';
import { instrument, persist } from './root';

const createRootReducer = () => combineReducers({
  root: require('./root/updater').default,
  routing: routerReducer
});
const createStore = compose(refractal, instrument, persist)(_createStore);
const store = createStore(createRootReducer());
const history = syncHistoryWithStore(browserHistory, store);

const init = () => {
  const View = require('./root').default;

  render(
    <View store={store} history={history} dispatch={store.dispatch} />,
    document.getElementById('root')
  );
};

if (module.hot) {
  module.hot.accept('./root', init);
  module.hot.accept('./root/updater', () => store.replaceReducer(createRootReducer()));
}

init();
