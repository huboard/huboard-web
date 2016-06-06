import Ember from 'ember';

var queryParamsService = Ember.Service.extend({
  filters: Ember.inject.service(),

  clear: function(){
    var self = this;
    self.get("filterNames").forEach(function(param){
      return self.set(`${param}Params`, []);
    });
    this.set("filterParamsBuffer", {});
    this.set("searchParams", "");
    this.set("searchParamsBuffer", "");
  },
  clearOnEmpty: function(){
    if(!this.get("filters.hideFilters.length")){
      this.clear();
    }
  }.observes("filters.hideFilters.[]"),

  ////Query Params for Filters
  repoParams: [],
  assigneeParams: [],
  milestoneParams: [],
  labelParams: [],
  cardParams: [],
  filterNames: ["repo", "assignee", "milestone", "label", "card"],
  allFilterParams: function(){
    var self = this;
    var filters = {length: 0};
    this.get("filterNames").forEach(function(param){
      filters.length = filters.length + 1;
      filters[param] = self.get(`${param}Params`);
    });
    return filters;
  }.property("{repo,assignee,milestone,label,card}Params"),
  anyParamsPresent: function(){
    var allFilterParams = this.get('allFilterParams');
    return this.get('filterNames').any((param)=>{
      return allFilterParams[param].length;
    });
  }.property('allFilterParams.{repo,assignee,milestone,label,card}.length'),

  filtersReady: function(){
    if(this.get("filters.filtersReady")){
      this.applyFilterParams(); 
      this.applySearchParams(); 
    }
  }.observes("filters.filtersReady"),

  //Push board, label, card and milestone filters to the URL
  updateFilterParams: function(){
    var self = this;
    var filters = this.get("filters");
    ["board", "label", "milestone", "card"].forEach(function(param){
      var hidden_filters = filters.get(`${param}Filters`).filter((f) => {
        return f.mode === 2;
      }).map(function(f){return f.name; });
      param = param === "board" ? "repo" : param;
      self.set(`${param}Params`, hidden_filters);
    });
  }.observes("filters.hideFilters.[]"),

  //Push user and member filters to the URL
  updateAssigneeParams: function(){
    var filters = this.get("filters.userFilters").
      concat(this.get("filters.memberFilters"));
    var hidden_filters = filters.filter(function(f){
      return f.mode === 2;
    }).map(function(f){return f.name; });
    this.set("assigneeParams", hidden_filters);
  }.observes("filters.hideFilters.[]"),

  //Pushes URL filters down to the filter objects on load
  applyFilterParams: function(){
    var legacyMatch = this.legacyFilterMatch;
    var allFilterParams = this.get('allFilterParams');
    this.get('filters.allFilters').forEach((filter)=>{
      var paramsForFilter = allFilterParams[filter.queryParam];
      if(paramsForFilter && paramsForFilter.length){
        var filterIsPresent = paramsForFilter.any((p)=> {
          return p === filter.name || p === legacyMatch(filter.name);
        });
        if(filterIsPresent){ filter.set('mode', 2); }
      }
    });
  },

  //Buffer the Filter Params for transitions (controllers initialization wipes them)
  filterParamsBuffer: {},
  updateFilterParamsBuffer: function(){
    if(this.get('anyParamsPresent')){
      this.set("filterParamsBuffer", this.get('allFilterParams'));
      this.set("filterParamsBuffer.active", true);
    }
  }.observes("anyParamsPresent", "allFilterParams"),
  applyFilterBuffer: function(){
    var buffer = this.get("filterParamsBuffer");
    if(buffer.active && !this.get('anyParamsPresent')){
      this.set("repoParams", buffer.repo);
      this.set("assigneeParams", buffer.assignee);
      this.set("milestoneParams", buffer.milestone);
      this.set("labelParams", buffer.label);
      this.set("cardParams", buffer.card);
      this.set("filterParamsBuffer", {});
    }
  },
  legacyFilterMatch: function(name){
    if(!name){ return false; }
    return name.replace(/\s+/g, '');
  },

  ////Query Params for Search
  searchParams: "",

  //Push search terms to the URL
  updateSearchParams: function(){
    if(!this.get("filters.model")){return;}
    var term = this.get("filters").group("search").get("term");
    this.set("searchParams", term);
  }.observes("filters.filterGroups.search.term.length").on("init"),

  //Pushes URL search term down to the search filter 
  applySearchParams: function(){
    var search = this.get("searchParams");
    if(search && search.length){
      this.set("filters.searchFilters.mode", 2); 
      this.get("filters").group("search").set("term", search);
    }
  },

  //Buffer the search term for transitions (controllers initialization wipes them)
  searchParamsBuffer: "",
  updateSearchParamsBuffer: function(){
    var search = this.get("searchParams");
    if(search && search.length){
      this.set("searchParamsBuffer", this.get("searchParams"));
    }
  }.observes("searchParams"),
  applySearchBuffer: function(){
    var buffer = this.get("searchParamsBuffer");
    var term = this.get("searchParams");
    if(buffer.length && !term.length){
      this.set("searchParams", buffer);
      this.set("searchParamsBuffer", "");
    }
  }
});

export default queryParamsService;
