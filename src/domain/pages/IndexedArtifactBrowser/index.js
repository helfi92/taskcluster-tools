import React from 'react';
import { view } from 'redux-elm';

export const title = 'Indexed Artifact Browser';
export const path = 'index/artifacts';
export const icon = 'folder-open';
export const description = `The indexed artifact browser lets you easily view the artifacts from the latest run of an
  indexed task.`;

export default view(({ model, dispatch }) => <div></div>);
