import WithClients from '../../components/WithClients';
import WorkerManager from './WorkerManager';

const View = ({ history, match, location }) => (
  <WithClients Queue AwsProvisioner>
    {clients => (
      <WorkerManager
        {...clients}
        history={history}
        location={location}
        provisionerId={
          match.params.provisionerId ? match.params.provisionerId : ''
        }
      />
    )}
  </WithClients>
);

export default View;
