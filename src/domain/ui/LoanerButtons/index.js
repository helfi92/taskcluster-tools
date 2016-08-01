import React from 'react';
import { view, forwardTo } from 'redux-elm';
import ConfirmAction from '../ConfirmAction';
import { Button } from 'react-bootstrap';
import { CREATE_TASK, EDIT_TASK } from './updater';

export default view((props) => {
  const { model, dispatch } = props;
  const isValid = !!(model.task && model.task.payload);
  const createTask = () => dispatch({ type: CREATE_TASK });
  const editTask = () => dispatch({ type: EDIT_TASK });

  return (
    <span>
      <ConfirmAction
        {...props}
        dispatch={forwardTo(dispatch, 'CONFIRM_ACTION')}
        model={model.confirmAction}
        action={createTask}
        glyph="console"
        label="One-Click Loaner"
        success="Task created"
        disabled={props.disabled || !isValid}>
          This will duplicate the task and create it under a different <code>taskId</code>.
          <p>The new task will be altered as to:</p>
          <ul>
            <li>Set <code>task.payload.features.interactive = true</code></li>
            <li>Strip <code>task.payload.caches</code> to avoid poisoning</li>
            <li>Ensure <code>task.payload.maxRunTime</code> is at least 60 minutes</li>
            <li>Strip <code>task.routes</code> to avoid side-effects</li>
            <li>Set the environment variable <code>TASKCLUSTER_INTERACTIVE = true</code></li>
          </ul>
          Note: this may not work with all tasks.
      </ConfirmAction>
      <Button {...props} disabled={props.disabled || !isValid} onClick={editTask}>
        Edit and Create Loaner Task
      </Button>
    </span>
  );
});
