import Ember from 'ember';

var FilterGroups = Ember.Service.extend({
  board: Ember.inject.service("filter_groups/board"),
  milestone: Ember.inject.service("filter_groups/milestone"),
  label: Ember.inject.service("filter_groups/label"),
  user: Ember.inject.service("filter_groups/user"),
  member: Ember.inject.service("filter_groups/member"),
  search: Ember.inject.service("filter_groups/search"),
  card: Ember.inject.service("filter_groups/card"),

  groups: function(){
    var groups = [];
    var services = this.get("__ember_meta__.values"); 
    _.each(services, function(k,v){
      if(v !== "groups"){ groups.addObject(v); }
    });
    return groups;
  }.property(),
});

export default FilterGroups;
