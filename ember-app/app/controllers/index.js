import Ember from 'ember';

var IndexController = Ember.Controller.extend({
  application: Ember.inject.controller(),
  registeredColumns: Ember.A(),

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

  isSidebarOpen: Ember.computed.alias("application.isSidebarOpen"),
  board_columns: function(){
     return this.get("model.columns");
  }.property("model.columns"),

  isCollaborator: function(){
    return this.get("model.repo.isCollaborator");
  }.property('model.repo.isCollaborator'),

  actions: {
    registerColumn: function(column_component){
      this.get("registeredColumns").pushObject(column_component);
    },
    unregisterColumn: function(column_component){
      this.get("registeredColumns").removeObject(column_component);
    },
    createFullscreenIssue: function(issue, order){
      this.get("target").send("createFullscreenIssue", issue, order);
    },
    openFullscreenIssue(issue){
      this.get("target").send("openFullscreenIssue", issue);
    },
    reopenIssueOrAbort(args){
      this.get("target").send("reopenIssueOrAbort", args);
    }
  }
});

export default IndexController;
