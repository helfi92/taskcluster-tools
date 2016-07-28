import React from 'react';
import { view } from 'redux-elm';

export const title = 'Pulse Inspector';
export const path = 'pulse-inspector';
export const icon = 'wifi';
export const description = `Bind to Pulse exchanges in your browser, observe messages arriving, and inspect messages.
  Useful when debugging and working with undocumented Pulse exchanges.`;

export default view(({ model, dispatch }) => <div></div>);
