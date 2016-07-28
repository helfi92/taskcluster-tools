import React from 'react';
import { view } from 'redux-elm';

export const title = 'Task Creator';
export const path = 'task-creator';
export const icon = 'pencil';
export const description = `Create and submit tasks from the task creator. Created tasks will be persistent in
  \`localStorage\` so you can try again with new parameters.`;

export default view(({ model, dispatch }) => <div></div>);
