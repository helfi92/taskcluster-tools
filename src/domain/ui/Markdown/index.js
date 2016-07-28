import React from 'react';
import marked from 'marked';
import './markdown.scss';

export default ({ children = '', sanitize = true, gfm = true }) => {
  const markup = marked(children, { sanitize, gfm });

  return <span className="markdown-view" dangerouslySetInnerHTML={{__html: markup}} />;
};
