import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.resource("index",{path: "/"},function(){
    this.resource("index.issue",{path:"/issues/:issue_id"});
  });

  this.resource("milestones", function(){
    this.resource("milestones.issue",{path:"/issues/:issue_id"});
  });
  this.route("milestones.missing");

  this.resource("projects", function(){
    this.resource("projects.project", {path:"/:project_id"}, function(){
      this.resource("projects.project.issue", {path:"/issues/:issue_id"});
    });
  });

  this.resource("settings", function(){

    this.resource('settings.integrations', {path: '/integrations'}, function(){
      this.route('new', {path: '/new/:name'});
    });

    this.resource('settings.links', {path: '/links'}, function(){
      this.route('new', {path: '/new/:name'});
    });

    this.resource('settings.health', {path: '/health'}, function(){
    });

  });

  this.resource("sync-issues");
});

export default Router;
