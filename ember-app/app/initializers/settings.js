import Settings from 'app/models/settings';
import Global from 'app/models/global';

export function initialize(container, application){
  application.register('repo:main', application.get("repo"), {instantiate: false});
  application.register('settings:main', Settings);
  application.inject('settings:main', 'repo', 'repo:main');
  application.inject('controller', 'settings', 'settings:main');
  application.inject('view', 'settings', 'settings:main');
  application.inject('component', 'settings', 'settings:main');

  application.register('global:main', Global);
  application.inject('controller', 'global', 'global:main');
  application.inject('view', 'global', 'global:main');
}

export default {
  name: 'settings',
  before: 'sockets',
  after: 'advanceReadiness',
  initialize: initialize
}

