import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { createDevTools, persistState } from 'redux-devtools';
import ChartMonitor from 'redux-devtools-chart-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';
import LogMonitor from 'redux-devtools-log-monitor';
import SliderMonitor from 'redux-slider-monitor';
import routing from '../common/routing';

const DEBUG = /[?&]debug_session=([^&]+)\b/;

const DevTools = createDevTools(
  <DockMonitor
    fluid={true}
    defaultIsVisible={false}
    defaultPosition="bottom"
    toggleVisibilityKey="ctrl-h"
    changePositionKey="ctrl-q"
    changeMonitorKey="ctrl-m">
      <LogMonitor />
      <SliderMonitor />
      <ChartMonitor />
  </DockMonitor>
);

export const instrument = DevTools.instrument();
export const persist = persistState(location.href.match(DEBUG));

export default ({ store, history, dispatch }) => (
  <Provider store={store}>
    <div>
      <Router history={history} routes={routing(dispatch)} />
      <DevTools />
    </div>
  </Provider>
);