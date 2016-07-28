import R from 'ramda';

export default (model = {}) => R.merge({
  taskcluster: null,
  task: null
}, model);
