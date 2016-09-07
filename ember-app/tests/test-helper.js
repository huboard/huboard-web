import resolver from './helpers/resolver';
import './helpers/flash-message';

import {
  setResolver
} from 'ember-qunit';

window.test_helpers = {
  // Determine if tests are running in Chrome
  is_chrome: window.navigator.userAgent.toLowerCase().indexOf('chrome') > -1,
 
  // Determine if tests are running in PhantomJS.
  is_phantom: window.navigator.userAgent.toLowerCase().indexOf('phantom') > -1
};

setResolver(resolver);
