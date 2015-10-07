import Ember from 'ember';

var FilterGroups = Ember.Service.extend({
  board: Ember.inject.service("filter_groups/board"),
  milestone: Ember.inject.service("filter_groups/milestone"),
  label: Ember.inject.service("filter_groups/label"),
  user: Ember.inject.service("filter_groups/user"),
  member: Ember.inject.service("filter_groups/member"),
  search: Ember.inject.service("filter_groups/search"),
  card: Ember.inject.service("filter_groups/card"),

  groups: ["board", "milestone", "label", "user", "member", "search", "card"]
});

export default FilterGroups;
