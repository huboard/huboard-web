import Ember from 'ember';

function attr(modelProp, map) {
  return Ember.computed("model." + modelProp, "model." + modelProp + ".[]", {
    get: function(key){

      var filters = this.get("model." + modelProp).map(map);

      return filters;
    },
    set: function(key, value){
      this.set("model." + key, value);
      return value;
    }
  });
}

var LabelFilters = Ember.Service.extend({
  filters: [],
  strategy: "grouping",

  create: function(model){
    this.set("filters", attr("filterLabels", function(l){
       return Ember.Object.create({
        name: l.name,
        queryParam: "label",
        mode:0,
        color: l.color,
        condition:function(i){
          return _.union(i.labels, i.other_labels).any(function(label){ 
             return l.name.toLocaleLowerCase() === label.name.toLocaleLowerCase();
          });
        }
       });
    }));

    return this.get("filters");
  }
});

export default LabelFilters;
