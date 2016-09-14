import Ember from 'ember';

var ProjectsController = Ember.Controller.extend({
  application: Ember.inject.controller(),

  qps: Ember.inject.service("query-params"),
  queryParams: [
    {"qps.searchParams": "search"},
    {"qps.repoParams": "repo"},
    {"qps.assigneeParams": "assignee"},
    {"qps.milestoneParams": "milestone"},
    {"qps.labelParams": "label"},
    {"qps.cardParams": "card"}
  ],

  filters: Ember.inject.service(),
  filtersActive: Ember.computed.alias("filters.active"),

  isCollaborator: function(){
    return this.get("model.repo.isCollaborator");
  }.property('model.repo.isCollaborator'),

  isSidebarOpen: Ember.computed.alias("application.isSidebarOpen"),

  actions: {
  }
});

export default ProjectsController;
