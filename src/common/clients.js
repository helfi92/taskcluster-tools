import R from 'ramda';
import { toPascal } from './util';
import taskcluster from 'taskcluster-client';

const clients = {
  auth: null,
  awsProvisioner: { baseUrl: 'https://aws-provisioner.taskcluster.net/v1' },
  queue: null,
  queueEvents: null,
  hooks: null,
  index: null,
  purgeCache: null,
  secrets: null,
  scheduler: null,
  schedulerEvents: null
};

/**
 * createClients :: Object -> Object
 */
export const createClients = (credentials) => {
  return R.mapObjIndexed((options, name) => {
    const method = toPascal(name);

    return options || credentials ?
      new taskcluster[method](R.merge(options, { credentials })) :
      new taskcluster[method]();
  }, clients);
};
