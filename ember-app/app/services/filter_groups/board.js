import Ember from 'ember';

function attr(modelProp, map) {
  return Ember.computed("model." + modelProp, "model." + modelProp + ".[]", {
    get: function(key){
      var model = this.get('model');

      var filters = this.get("model." + modelProp).map(map);

      filters.insertAt(0, Ember.Object.create({
      name: model.get('repo.name'),
      queryParam: "repo",
      mode:0,
      color: "7965cc",
      condition:function(i){
        return i.repo.name === model.get('repo.name');
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

var BoardFilters = Ember.Service.extend({
  filters: [],
  strategy: "inclusive",

  create: function(model){
    var owner = model.get("full_name").split("/")[0];

    this.set("filters", attr("linkedRepos", function(l){
       var name = owner === l.repo.owner.login ? l.repo.name : l.repo.full_name;
       return Ember.Object.create({
        name: name,
        queryParam: "repo",
        mode:0,
        color: l.repo.color,
        condition:function(i){
          return i.repo.name === l.repo.name && i.repo.owner.login === l.repo.owner.login;
        }
       });
    }));

    return this.get("filters");
  }
});

export default BoardFilters;
