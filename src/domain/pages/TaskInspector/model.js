import R from 'ramda';
import taskView from '../../ui/TaskView/model';

export default (model = {}) => R.merge({
  taskId: '',
  taskView: taskView(R.pick(['taskcluster'], model))
}, model);
