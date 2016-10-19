import BrowserSession from 'huboard-app/services/browser-session';

export function initialize(container, application){
  application.register('browser-session:main', BrowserSession);
  application.inject('controller', 'browser-session', 'browser-session:main');
  application.inject('component', 'browser-session', 'browser-session:main');
}

export default {
  name: 'browser-session',
  after: 'advanceReadiness',
  initialize: initialize
};

