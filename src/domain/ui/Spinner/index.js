import React from 'react';
import Icon from '../Icon';

import './index.scss';

export default () => (
  <div className="spinner">
    <Icon name="spinner" size="2x" spin={true} />
  </div>
);
