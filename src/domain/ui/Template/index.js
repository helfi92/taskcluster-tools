import React from 'react';
import { view } from 'redux-elm';
import Helmet from 'react-helmet';
import Navigation from '../Navigation';

export default view((props) => {
  const { currentPage, shortcutIcon } = props.model;

  return (
    <div id="wrapper">
      <Navigation {...props} />
      <div id="container" className="container-fluid">{props.children}</div>
      <Helmet
        title={currentPage.title}
        link={[{ rel: 'shortcut icon', href: shortcutIcon }]} />
    </div>
  );
});
