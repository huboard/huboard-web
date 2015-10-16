import Ember from 'ember';

var AssigneeController = Ember.Controller.extend({
  filters: Ember.inject.service(),
  avatarsBinding: "model.avatars",
  memberFiltersBinding: "filters.memberFilters",

  noActiveMembers: function(){
    return this.get("avatars").length === 0;
  }.property("avatars"),
});

export default AssigneeController;
