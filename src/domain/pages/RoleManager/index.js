import React from 'react';
import { view } from 'redux-elm';

export const title = 'Role Manager';
export const path = 'auth/roles';
export const icon = 'shield';
export const description = `Manage roles on \`auth.taskcluster.net\`. This tool allows you to create, modify, and delete
  roles. You can also manage scopes and and explore indirect scopes.`;

export default view(({ model, dispatch }) => <div></div>);
