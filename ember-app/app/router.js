import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {

  this.route("index",{path: "/"},function(){
    this.route("issue",{path:"/issues/:issue_id"});
  });

  this.route("milestones", function(){
    this.route("issue",{path:"/issues/:issue_id"});
  });

  this.route("milestones.missing");

  this.route("settings", function(){

    this.route('integrations', {path: '/integrations'}, function(){
      this.route('new', {path: '/new/:name'});
    });

    this.route('links', {path: '/links'}, function(){
      this.route('new', {path: '/new/:name'});
    });

    this.route('health', {path: '/health'}, function(){ });
  });

  this.route("sync-issues");
});

export default Router;
