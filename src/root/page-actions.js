import R from 'ramda';
import { getActionKey, extractNameFromFile, getModelKey } from '../common/util';

const MOUNT = '@@redux-elm/Mount';

const req = require.context('../domain', true, /updater\.js/igm);
export const updaters = R.map((file) => {
  const updater = req(file);
  const name = extractNameFromFile(file);

  return {
    modelKey: getModelKey(name),
    reducer: updater.default,
    actionKey: getActionKey(name)
  };
}, req.keys());

export default (rootUpdater) => R
  .reduce((rootUpdater, { modelKey, reducer, actionKey }) => {
    rootUpdater.case(actionKey, (model, action) => {
      const base = R.pick(['taskcluster'], model);
      const viewModel = action.type === MOUNT ?
        R.mergeAll([model.views[modelKey], base, model.params]) :
        R.merge(model.views[modelKey], base);

      return R.assocPath(['views', modelKey], reducer(viewModel, action), model);
    });

    return rootUpdater;
  }, rootUpdater, updaters);
