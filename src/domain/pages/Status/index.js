import React from 'react';
import { view } from 'redux-elm';

export const title = 'Status';
export const path = 'status';
export const icon = 'cogs';
export const description = `Display the status of Taskcluster and TaskCluster-dependent services.`;

export default view(({ model, dispatch }) => <div></div>);
