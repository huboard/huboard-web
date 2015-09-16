import Ember from 'ember';
import correlationId from 'app/utilities/correlation-id';

var MilestonesController = Ember.Controller.extend({
  needs: ["application"],
  filters: Ember.inject.service(),
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
  applyUrlFilters: function(){
    var self = this;
    Ember.run.once(function(){
      self.get("qps").applyFilterParams();
      self.get("qps").applySearchParams();
    });
  }.observes("qps.filterParams", "qps.searchParams").on("init"),

  filtersActive: Ember.computed.alias("filters.filterGroups.active"),
  isCollaborator: function(){
    return this.get("model.repo.isCollaborator");
  }.property('model.repo.isCollaborator'),

  isSidebarOpen: Ember.computed.alias("controllers.application.isSidebarOpen"),

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
    //var milestones = _.chain(this.get("model.combinedMilestones")).map(function(groups) {
    //  var m = _.first(groups);

    //  return Ember.Object.create({
    //    title: m.title,
    //    orderable: true,

    //    filterBy: function(i) {
    //      return i.milestone && i.milestone.title.toLocaleLowerCase() === m.title.toLocaleLowerCase();
    //    },

    //    milestone: m,
    //    group: groups
    //  });
    //}).value().sort(function(a, b) {
    //  return a.milestone._data.order - b.milestone._data.order;
    //});
    //milestones.insertAt(0, this.get("left_column"));
    //return milestones;
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
    },
    milestoneReordered: function(old_ms, new_ms){
      var _self = this;
      Ember.run.once(function(){
        _self.get("model.milestones").removeObject(old_ms);
        _self.get("model.milestones").pushObject(new_ms);
      });
    }
  }
});

export default MilestonesController;
