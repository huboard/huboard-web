import Ember from "ember";

function attr(group) {
  return Ember.computed('filterGroups.' + group + ".filters", {
    get: function(){
      return this.get('filterGroups.' + group + ".filters");
    }
  });
}

var FiltersService = Ember.Service.extend({
  model: null,
  hideFilters: [],
  dimFilters: [],

  qps: Ember.inject.service("query-params"),
  clear: function(){
    this.get("qps").clear();
    this.get("allFilters").setEach("mode", 0);
    this.set("filterGroups.search.term", "");
  },

  //Accessors for filterGroups
  filterGroups: Ember.inject.service(),
  allFilters: function(){
    var filters = [];
    var _self = this;
    this.get("groups").forEach(function(group){
      filters = filters.concat(_self.group(group).get("filters"));
    });
    this.set("filtersReady", true);
    return filters;
  }.property("filterGroups.{board,milestone,label,user,member,search,card}.filters.@each.mode", "model"),
  groups: Ember.computed.alias("filterGroups.groups"),
  group: function(group_key){
    var group = this.get(`filterGroups.${group_key}`);
    if(!group.get("model")){
      group.set("model", this.get("model"));
      group.create(this.get("model"));
    }
    return group;
  },

  //Make computed filters available via the FiltersService
  unknownProperty: function(key){
    if (!this.get("model")){ return; }
    key = key.replace("Filters", "");
    if (this.group(key).get("filters")){
      this.set(key+ "Filters", attr(key));
      return this.get(key + "Filters");
    }
  },

  active: function(){
    return this.get("allFilters").any(function(f){
      return Ember.get(f, "mode") !== 0;
    });
  }.property("allFilters.@each.mode"),

  anyFiltersChanged: function(){
    var self = this;
    Ember.run.once(function(){
      var allFilters = self.get("allFilters");

      self.set("dimFilters", allFilters.filter(function(f){
        return f.mode === 1;
      }));

      self.set("hideFilters", allFilters.filter(function(f){
        return f.mode === 2;
      }));
    });
  }.observes("allFilters.@each.mode"),

  //// Filter Groups based on their strategy, sub-filtered by mode i.e
  // {
  //   grouping: {
  //     labels: []
  //   },
  //   inclusive: {
  //     member: [],
  //     board: []
  //   }
  // }
  //
  hiddenFiltersObject: function(){
    if (!this.get("model")){ return {}; }
    var self = this;
    var groups = {};
    this.get("groups").forEach(function(group){
      var filters = self.group(group).get("filters");
      var strategy = self.group(group).get("strategy");
      if(!groups[strategy]){ groups[strategy] = {}; }
      groups[strategy][group] = filters.filter(function(f){
        return f.mode === 2;
      });
    });
    return groups;
  }.property("hideFilters.[]"),
  dimFiltersObject: function(){
    if (!this.get("model")){ return {}; }
    var self = this;
    var groups = {};
    this.get("groups").forEach(function(group){
      var filters = self.group(group).get("filters");
      var strategy = self.group(group).get("strategy");
      if(!groups[strategy]){ groups[strategy] = {}; }
      groups[strategy][group] = filters.filter(function(f){
        return f.mode === 1;
      });
    });
    return groups;
  }.property("dimFilters.[]"),

  //Forces Dim filter groups to active if there are other actives present
  //within that same group
  forceMembersOrUsersToActive: function(){
    var member_active = this.groupActive(this.get("memberFilters"));
    var user_active = this.groupActive(this.get("userFilters"));
    if(member_active || user_active){
      this.get("userFilters").concat(this.get("memberFilters"))
        .forEach(function(f){
          if (f.mode === 1){ Ember.set(f, "mode", 2); }
        });
    }
  }.observes("filterGroups.{member,user}.filters.@each.mode"),
  forceLabelsToActive: function(){
    if(this.groupActive(this.get("labelFilters"))){
      this.get("labelFilters").forEach(function(f){
        if (f.mode === 1){ Ember.set(f, "mode", 2); }
      });
    }
  }.observes("filterGroups.label.filters.@each.mode"),
  forceBoardsToActive: function(){
    if(this.groupActive(this.get("boardFilters"))){
      this.get("boardFilters").forEach(function(f){
        if (f.mode === 1){ Ember.set(f, "mode", 2); }
      });
    }
  }.observes("filterGroups.board.filters.@each.mode"),
  forceMilestonesToActive: function(){
    if(this.groupActive(this.get("milestoneFilters"))){
      this.get("milestoneFilters").forEach(function(f){
        if (f.mode === 1){ Ember.set(f, "mode", 2); }
      });
    }
  }.observes("filterGroups.milestone.filters.@each.mode"),
  forceOnlyOneActiveCard: function(){
    var filters = this.get("cardFilters");
    if (filters && filters.length){
      var active = filters.filter(function(f){
        return f.mode === 1 || f.mode === 2;
      });
      if(active.length > 1){ filters.setEach("mode", 0); }
    }
  }.observes("filterGroups.card.filters.@each.mode"),
  groupActive: function(filters){
    if (!filters || !filters.length){ return false;}
    return filters.any(function(f){
      return f.mode === 2;
    });
  },
});

export default FiltersService;
