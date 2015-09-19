import Ember from "ember";

var CardFilters = Ember.Service.extend({
  filters: [],
  strategy: "grouping",

  create: function(){
    this.set("filters", [
      Ember.Object.create({
        name: "Issues only",
        queryParam: "card",
        mode: 0,
        condition: function(i){
          return !i.data.pull_request;
        }
      }),
      Ember.Object.create({
        name: "Pull requests only",
        queryParam: "card",
        mode: 0,
        condition: function(i){
          return i.data.pull_request;
        }
      })
    ]);

    return this.get("filters");
  }
});

export default CardFilters;
