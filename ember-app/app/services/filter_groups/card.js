import Ember from "ember";

var CardFilters = Ember.Service.extend({
  filters: [],
  strategy: "exclusive",

  create: function(){
    this.set("filters", [
      Ember.Object.create({
        name: "PR's Only",
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
