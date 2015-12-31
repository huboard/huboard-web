import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});



Router.map(function() {
  this.route('profile', {path: '/:profile_id'}, function() {
    this.route('plans', {path: '/'});
    this.route('billing');
  });

  this.route('user_profile', {path: '/'}, function() {
    this.route('plans', {path: '/'});
    this.route('billing');
  });
});

export default Router;
