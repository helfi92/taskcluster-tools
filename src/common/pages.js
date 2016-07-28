import R from 'ramda';
import React from 'react';
import { connect as _connect } from 'react-redux';
import { forwardTo } from 'redux-elm';
import { extractNameFromFile, getModelKey, getActionKey } from './util';

/**
 * connect :: Component -> String -> [String] -> Component
 */
const connect = (View, modelKey, ...nesting) => {
  return modelKey === 'app' ?
    _connect(state => ({ model: state.root }))(props => <View {...props} />) :
    _connect(state => ({ model: state.root.views[modelKey] }))(props => (
      <View {...props} dispatch={forwardTo(props.dispatch, ...nesting)} />
    ));
};

const req = require.context('../domain/pages', true, /index\.js/igm);
const pages = req
  .keys()
  .reduce((pages, f) => {
    const name = extractNameFromFile(f);
    const value = req(f);
    const actionKey = getActionKey(name);

    pages[name] = R.merge(value, {
      actionKey,
      component: connect(value.default, getModelKey(name), actionKey),
    });

    return pages;
  }, {});

export default pages;
export const { Home, NotFound } = pages;
export const Template = connect(require('../domain/ui/Template').default, 'app', 'APP');
