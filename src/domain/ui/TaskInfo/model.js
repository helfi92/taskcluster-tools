import R from 'ramda';
import confirmActionButton from '../ConfirmAction/model';
import retriggerButton from '../RetriggerButton/model';
import purgeCacheButton from '../PurgeCacheButton/model';
import loanerButtons from '../LoanerButtons/model';

export const taskStatusStateLabel = {
  unscheduled: 'label label-default',
  pending: 'label label-info',
  running: 'label label-primary',
  completed: 'label label-success',
  failed: 'label label-danger',
  exception: 'label label-warning'
};

/**
 * purgeCacheModel :: Object -> Object
 */
export const purgeCacheModel = (model) => ({
  taskcluster: model.taskcluster,
  caches: R.keys(R.pathOr({}, ['task', 'payload', 'cache'], model)),
  provisionerId: R.path(['task', 'provisionerId'], model),
  workerType: R.path(['task', 'workerType'], model)
});

/**
 * taskButtonModel :: Object -> Object
 */
export const taskButtonModel = R.pick(['taskcluster', 'task']);

export default (model = {}) => R.merge({
  taskcluster: null,
  taskStatus: null,
  taskLoading: false,
  taskLoaded: false,
  task: null,
  label: taskStatusStateLabel.unscheduled,
  confirmScheduleTask: confirmActionButton(),
  confirmCancelTask: confirmActionButton(),
  confirmEditTask: confirmActionButton(),
  loanerButtons: loanerButtons(taskButtonModel(model)),
  retriggerButton: retriggerButton(taskButtonModel(model)),
  purgeCacheButton: purgeCacheButton(purgeCacheModel(model))
}, model);
