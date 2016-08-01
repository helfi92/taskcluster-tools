import R from 'ramda';
import React from 'react';
import { view, forwardTo } from 'redux-elm';
import ConfirmAction from '../ConfirmAction';
import { PURGE, UPDATE } from './updater';

export default view((props) => {
  const { model, dispatch } = props;
  const purge = () => dispatch({ type: PURGE });
  const update = (e) => dispatch({ type: UPDATE, payload: { value: e.target.value, isChecked: e.target.checked } });

  return (
    <ConfirmAction
      {...props}
      dispatch={forwardTo(dispatch, 'CONFIRM_ACTION')}
      model={model.confirmAction}
      action={purge}
      buttonSize="xsmall"
      buttonStyle="danger"
      glyph="trash"
      label="Purge worker cache"
      success="Cache successfully purged!"
      disabled={R.isEmpty(model.caches)}>
        <div>
          <p>Are you sure you wish to purge caches used in this task across all workers of this worker-type?</p>
          <p>Select the caches to purge:</p>
          <ul>
            {R.map(cache => (
              <li className="checkbox" key={cache}>
                <label>
                  <input
                    name="cache"
                    type="checkbox"
                    value={cache}
                    onChange={update}
                    checked={model.selected.includes(cache)} /> {cache}
                </label>
              </li>
            ), model.caches)}
          </ul>
        </div>
        This will duplicate the task and create it under a different <code>taskId</code>.
        <p>The new task will be altered as to:</p>
        <ul>
          <li>Update deadlines and other timestamps for the current time.</li>
        </ul>
        Note: this may not work with all tasks.
    </ConfirmAction>
  );
});
