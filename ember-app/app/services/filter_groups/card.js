import Ember from "ember";

var CardFilters = Ember.Service.extend({
  filters: [],
  strategy: "grouping",

  create: function(){
    this.set("filters", [
      Ember.Object.create({
        name: "Issues Only",
        queryParam: "cards",
        mode: 0,
        condition: function(i){
          return !i.pull_request;
        }
      }),
      Ember.Object.create({
        name: "Pull Requests Only",
        queryParam: "cards",
        mode: 0,
        condition: function(i){
          return i.pull_request;
        }
      })
    ]);

    return this.get("filters");
  }
});

export default CardFilters;
