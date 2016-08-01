import React from 'react';
import { highlight } from 'highlight.js';

export default ({ language, children }) => (
  <pre className={`language-${language}`}>
    <code dangerouslySetInnerHTML={{ __html: highlight(language, children, true).value }} />
  </pre>
);
