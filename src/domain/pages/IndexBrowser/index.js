import React from 'react';
import { view } from 'redux-elm';

export const title = 'Index Browser';
export const path = 'index';
export const icon = 'sitemap';
export const description = `The generic index browser lets you browse through the hierarchy of namespaces in the index
  and discover indexed tasks.`;

export default view(({ model, dispatch }) => <div></div>);
