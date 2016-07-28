import React from 'react';
import { view } from 'redux-elm';

export const title = 'Task Group Inspector';
export const path = 'task-group-inspector';
export const icon = 'cubes';
export const description = `Inspect task groups, monitor progress, view dependencies, states, and inspect the individual
  tasks that makes up the task group using the embedded task-inspector.`;

export default view(({ model, dispatch }) => <div></div>);
