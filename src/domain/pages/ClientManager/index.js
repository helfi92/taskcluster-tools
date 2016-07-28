import React from 'react';
import { view } from 'redux-elm';

export const title = 'Client Manager';
export const path = 'auth/clients';
export const icon = 'users';
export const description = `Manage clients on \`auth.taskcluster.net\`. This tool allows you to create, modify, and
  delete clients. You can also reset \`accessToken\`s and explore indirect scopes.`;

export default view(({ model, dispatch }) => <div></div>);
