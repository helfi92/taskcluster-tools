import R from 'ramda';
import taskInfo from '../TaskInfo/model';
// import runInfo from '../RunInfo/model';

export default (model = {}) => {
  const clientModel = R.pick(['taskcluster'], model);

  return R.merge({
    taskcluster: null,
    currentTab: '',
    taskId: '',
    taskStatusLoading: false,
    taskStatusLoaded: false,
    taskStatus: null,
    taskInfo: taskInfo(clientModel),
    // runInfo: null
  }, model);
};
