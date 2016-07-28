import React from 'react';
import { view, forwardTo } from 'redux-elm';
import ConfirmAction from '../ConfirmAction';
import { CREATE_TASK } from './updater';

export default view((props) => {
  const { model, dispatch } = props;
  const createTask = () => dispatch({ type: CREATE_TASK });
  const isValid = !!(model.task && model.task.payload);

  return (
    <ConfirmAction
      {...props}
      dispatch={forwardTo(dispatch, 'CONFIRM_ACTION')}
      glyph="repeat"
      label="Retrigger Task"
      success="Task created"
      disabled={props.disabled || !isValid}
      action={createTask}>
        This will duplicate the task and create it under a different <code>taskId</code>.
        <p>The new task will be altered as to:</p>
        <ul>
          <li>Update deadlines and other timestamps for the current time.</li>
        </ul>
        Note: this may not work with all tasks.
    </ConfirmAction>
  );
});
