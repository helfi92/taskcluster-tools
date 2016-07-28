import pages from './pages';
import external from './external';

export default [
  [
    pages.TaskInspector,
    pages.TaskGraphInspector,
    pages.TaskGroupInspector,
    pages.TaskCreator,
    pages.AwsProvisioner,
    pages.ClientManager,
    pages.RoleManager,
    pages.PulseInspector,
    pages.IndexBrowser,
    pages.IndexedArtifactBrowser,
    pages.HooksManager,
    pages.SecretsManager
  ],
  [
    external.Documentation,
    external.GitHub,
    external.Bugzilla,
    pages.Status,
    pages.Diagnostics
  ]
];
