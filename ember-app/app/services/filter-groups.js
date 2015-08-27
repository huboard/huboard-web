import Ember from 'ember';

var FilterGroups = Ember.Service.extend({
  board: Ember.inject.service("filter_groups/board"),
  milestone: Ember.inject.service("filter_groups/milestone"),
  label: Ember.inject.service("filter_groups/label"),
  user: Ember.inject.service("filter_groups/user"),
  member: Ember.inject.service("filter_groups/member"),
  search: Ember.inject.service("filter_groups/search"),
  card: Ember.inject.service("filter_groups/card"),

  groups: ["board", "milestone", "label", "user", "member", "search", "card"],
  setGroups: function(model){
    var self = this;
    this.get("groups").forEach(function(group){
      var group = self.get(group);
      group.set('model', model);
      group.create(model);
    });
    this.set("created", true);
  },

  allFilters: function(){
    if(!this.get("created")){ return []; }
    return this.get("milestone.filters")
            .concat(this.get("user.filters"))
            .concat(this.get("board.filters"))
            .concat(this.get("label.filters"))
            .concat(this.get("member.filters"))
            .concat(this.get("search.filters"))
            .concat(this.get("card.filters"));
  }.property("{board,milestone,label,user,member,search,card}.filters.@each.mode"),

  active: function(){
    return this.get("allFilters").any(function(f){
      return Ember.get(f, "mode") !== 0;
    });
  }.property("allFilters.@each.mode"),
});

export default FilterGroups;
