import R from 'ramda';

export default (model = {}) => R.merge({
  disabled: false,
  showDialog: false,
  executing: false,
  resultLoaded: false,
  resultError: null,
  result: null
}, model);
