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
  strategy: "inclusive",

  create: function(){
    this.set("filters", attr("columns", function(c){
       return Ember.Object.create({
        name: c.data.text,
        queryParam: "column",
        mode:0,
        condition: function(i){
          return i.get("current_state.index") === c.data.index;
        }
       });
    }));

    return this.get("filters");
  }
});

export default LabelFilters;
