import R from 'ramda';
import confirmAction from '../ConfirmAction/model';

export default (model = {}) => R.merge({
  taskcluster: null,
  task: null,
  confirmAction: confirmAction()
}, model);
