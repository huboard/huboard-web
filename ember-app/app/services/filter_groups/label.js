import Ember from 'ember';

function attr(modelProp, map) {
  return Ember.computed("model." + modelProp, "model." + modelProp + ".[]", {
    get: function(){

      var filters = this.get("model." + modelProp).map(map);

      if(this._filters){
        this._filters.forEach(function(f){
          var newOne = filters.findBy('name', f.name);
          if(newOne){
            newOne.set('mode', f.mode);
          }
        });
      }
      this._filters = filters;

      return filters.sortBy("name");
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

  create: function(){
    this.set("filters", attr("labels", function(l){
       return Ember.Object.create({
        name: l.label.name,
        queryParam: "label",
        mode:0,
        color: l.label.color,
        condition:function(i){
          return i.data.other_labels.any(function(label){
             return l.label.name.toLocaleLowerCase() === label.name.toLocaleLowerCase();
          });
        }
       });
    }));

    return this.get("filters");
  }
});

export default LabelFilters;
