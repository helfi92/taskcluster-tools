import React from 'react';
import { Overlay, Popover } from 'react-bootstrap';

export default ({ model, dispatch, target }) => {
  if (!model.credentialsMessage) {
    return null;
  }

  const hide = () => dispatch({ type: 'HIDE_CREDENTIALS_MESSAGE' });

  return (
    <Overlay show={true} rootClose={true} onHide={hide} placement="bottom" target={target}>
      <Popover id="signin-alert" title={model.credentialsMessage.title}>
        {model.credentialsMessage.body}
      </Popover>
    </Overlay>
  );
};
