import React from 'react';
import { view } from 'redux-elm';
import { Glyphicon, Modal } from 'react-bootstrap';
import { Button } from '../Bootstrap';
import Spinner from '../Spinner';

export default view(({ dispatch, children, model, ...props }) => {
  const openModal = () => dispatch({ type: 'SHOW_CONFIRM_ACTION' });
  const closeModal = () => dispatch({ type: 'CLOSE_CONFIRM_ACTION' });
  const executeAction = () => dispatch({ type: 'EXECUTE_ACTION', payload: props.action });

  return (
    <Button bsSize={props.buttonSize} bsStyle={props.buttonStyle} disabled={props.disabled} onClick={openModal}>
      <Glyphicon glyph={props.glyph} /> <span>{props.label}</span>
      <Modal bsStyle="primary" show={model.showDialog} onHide={closeModal}>
        <Modal.Header closeButton={true}>{props.label}</Modal.Header>
        <Modal.Body>
          <span>{children}</span>
          {(() => {
            if (!model.executing) {
              return;
            }

            return (
              <span>
                <hr />
                <h4>Status</h4>
                <span>
                  {model.resultLoaded ? props.success : <Spinner />}
                </span>
              </span>
            );
          })()}
        </Modal.Body>
        <Modal.Footer>
          {(() => {
            if (!model.executing || !model.result) {
              return (
                <Button onClick={executeAction} bsStyle={props.buttonStyle} hidden={!!model.result}>
                  <Glyphicon glyph={props.glyph} /> <span>{props.label}</span>
                </Button>
              );
            }
          })()}
          <Button onClick={closeModal} bsStyle="default">
            <Glyphicon glyph="remove" /> Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Button>
  );
});
