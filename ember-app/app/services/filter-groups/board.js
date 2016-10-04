import Ember from 'ember';

function attr(modelProp, map) {
  return Ember.computed("model." + modelProp, {
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

      return filters;
    },
    set: function(key, value){
      this.set("model." + key, value);
      return value;
    }
  });
}

var BoardFilters = Ember.Service.extend({
  filters: [],
  strategy: "inclusive",

  create: function(model){
    var owner = model.get("repo.data.repo.full_name").split("/")[0];

    this.set("filters", attr("repos.[]", function(l){
       var name = owner === l.data.repo.owner.login ? l.data.repo.name : l.data.repo.full_name;
       return Ember.Object.create({
        name: name,
        queryParam: "repo",
        mode:0,
        color: l.data.repo.color ? l.data.repo.color.color : "7965cc",
        condition:function(i){
          return i.data.repo.name === l.data.repo.name && i.data.repo.owner.login === l.data.repo.owner.login;
        }
       });
    }));

    return this.get("filters");
  }
});

export default BoardFilters;
