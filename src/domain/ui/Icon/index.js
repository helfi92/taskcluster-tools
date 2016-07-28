import React from 'react';

export default (props) => {
  let className = `fa fa-${props.name}`;
  
  if (props.size) {
    className += ` fa-${props.size}`;
  }
  
  if (props.rotate) {
    className += ` fa-rotate-${props.rotate}`;
  }
  
  if (props.flip) {
    className += ` fa-flip-${props.flip}`;
  }
  
  if (props.fixedWidth) {
    className += ' fa-fw';
  }
  
  if (props.spin) {
    className += ' fa-spin';
  }
  
  if (props.className) {
    className += ` ${props.className}`;
  }
  
  return <span {...props} className={className} />;
};
