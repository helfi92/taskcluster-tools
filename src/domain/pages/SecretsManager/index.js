import React from 'react';
import { view } from 'redux-elm';

export const title = 'Secrets Manager';
export const path = 'secrets';
export const icon = 'user-secret';
export const description = `Manage secrets, i.e. values that can only be retrieved with the appropriate scopes.`;

export default view(({ model, dispatch }) => <div></div>);
