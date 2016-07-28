import React from 'react';
import { view } from 'redux-elm';

export const title = 'Task Graph Inspector';
export const path = 'task-graph-inspector';
export const icon = 'cubes';
export const description = `Inspect task-graphs, monitor progress, view dependencies, states, and inspect the individual
  tasks that makes up the task-graph, using the embedded task-inspector.`;

export default view(({ model, dispatch }) => <div></div>);
