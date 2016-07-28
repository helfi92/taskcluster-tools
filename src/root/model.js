import R from 'ramda';
import { getModelKey, extractNameFromFile } from '../common/util';
import icons from '../common/icons';
import { Home } from '../common/pages';
import menu from '../common/menu';
import { createClients } from '../common/clients';

const defaultModel = {
  menu,
  taskcluster: createClients(),
  shortcutIcon: icons[Home.icon],
  currentPage: Home,
  credentials: null,
  credentialsExpiringSoon: false,
  credentialsMessage: null,
  views: {}
};

const req = require.context('../domain/pages', true, /model\.js/igm);
const viewModels = R
  .reduce((model, file) => {
    const name = extractNameFromFile(file);
    const init = req(file).default;
    const viewModel = R.pick(['taskcluster'], defaultModel);

    model[getModelKey(name)] = R.is(Function, init) ?
      init(viewModel) :
      R.merge(init, viewModel);

    return model;
  }, {}, req.keys());

export default R.merge(defaultModel, { views: viewModels });
