import R from 'ramda';
import React from 'react';
import pages, { Home, NotFound, Template } from './pages';

export const URL_CHANGE = 'URL_CHANGE';

export default (dispatch) => {
  /**
   * toRoutes :: Object -> List Object
   */
  const toRoutes = R.pipe(
    R.dissoc('Home'),
    R.dissoc('NotFound'),
    R.values,
    R.append(NotFound),
    R.map(route => R.assoc('onEnter', (nextState) => dispatch({
      type: URL_CHANGE,
      payload: {
        route,
        nextState
      }
    }), route))
  );

  return {
    path: '/',
    component: Template,
    indexRoute: Home,
    childRoutes: toRoutes(pages)
  };
};
