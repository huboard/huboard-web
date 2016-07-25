import Ember from 'ember';

var MilestonesController = Ember.Controller.extend({
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

  isCollaborator: function(){
    return this.get("model.repo.isCollaborator");
  }.property('model.repo.isCollaborator'),

  isSidebarOpen: Ember.computed.alias("application.isSidebarOpen"),

  left_column: function() {
    return Ember.Object.create({
      title: "No milestone",
      noMilestone: true,
      orderable: false,

      filterBy: function(i) {
        return !Ember.get(i, "milestone");
      },
    });
  }.property(),

  milestone_columns: function() {
    return this.get('model.milestone_columns');
  }.property("model.milestone_columns.[]"),

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
    createMilestoneOrAbort: function(model){
      this.get("target").send("createMilestoneOrAbort", model);
    },
    editMilestone: function(column){
      this.get("target").send("editMilestone", column);
    }
  }
});

export default MilestonesController;
