import R from 'ramda';
import confirmAction from '../ConfirmAction/model';

export default (model = {}) => R.merge({
  taskcluster: null,
  provisionerId: '',
  workerType: '',
  caches: [],
  selected: model.caches || [],
  confirmAction: confirmAction()
}, model);
