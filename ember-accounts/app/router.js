import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});



Router.map(function() {

  this.route('settings', {path: '/'}, function() { 
    this.route('profile', {path: '/:profile_id'}, function() {
      this.route('plans', {path: '/'});
      this.route('billing');
    });

    this.route('user-profile', {path: '/'}, function() {
      this.route('plans', {path: '/'});
      this.route('billing');
    });
  });
  
  this.route('not-authorized');
});

export default Router;
