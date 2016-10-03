import Ember from 'ember';

function attr(modelProp, map) {
  return Ember.computed("model." + modelProp, {
    get: function(){
      var filters = this.get("model." + modelProp).map(map);
      filters.insertAt(0, Ember.Object.create({
        name: 'No milestone',
        queryParam: "milestone",
        mode:0,
        condition:function(i){
          return i.data.milestone == null;
        }
      }));
      if(this._filters){
        this._filters.forEach(function(f){
          var newOne = filters.findBy('name', f.name);
          if(newOne){
            newOne.set('mode', f.mode);
          }
        });
      }
      this._filters = filters;
      return filters;
    },
    set: function(key, value){
      this.set("model." + key, value);
      return value;
    }
  });
}

var MilestoneFilters = Ember.Service.extend({
  filters: [],
  strategy: "inclusive",

  create: function(){
    this.set("filters", attr("milestones", function(m){
      return Ember.Object.create({
        name: m.milestone.data.title,
        queryParam: "milestone",
        mode:0,
        condition:function(i){
          return i.data.milestone && i.data.milestone.title.toLocaleLowerCase() === m.milestone.data.title.toLocaleLowerCase();
        }
      });
    }));
    return this.get("filters");
  }
});

export default MilestoneFilters;
