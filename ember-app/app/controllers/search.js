import Ember from 'ember';
import { debouncedObserver } from 'app/utilities/observers';


var SearchController = Ember.Controller.extend({
  needs:["application"],
  searchBinding: "controllers.application.search",
  updateSearch: function(){
    if (this.get("term").length) {
      this.set("search", this.get("term").trim());
    } else {
      this.set("search", null);
    }
  }.observes('term'),
  checkForQueryParams: function(){
    if (this.get("search")) {
      this.set("term", this.get("search"));
    }
  }.on("init"),
  term: "",
  termChanged : debouncedObserver(function(){
    var term = this.get("term");
    var issues = this.get("controllers.application.model.board.combinedIssues");
    var threshold = isNaN(term) ? 0.4 : 0.1;
    var Searcher = new Fuse(issues, {keys: ["title","number_searchable"], id: "id", threshold: threshold});
    var results = Searcher.search(term);
    App.set("searchFilter", {
      strategy: "inclusive",
      condition: function(i){
       return term.length === 0 || results.indexOf(i.id) !== -1;
      },
    });

  },"term", 300),
  filtersActive: function(){
    return this.get("term").length;
  }.property("term"),
  actions : {
    clearFilters : function(){
      var self = this;
      self.set("term", "");
      Ember.run.later(function(){
        App.set("searchFilter", null);
      }, 500)
    }
  }
});

export default SearchController;
