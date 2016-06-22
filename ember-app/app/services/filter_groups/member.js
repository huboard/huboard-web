import Ember from 'ember';

var MemberFilters = Ember.Service.extend({
  strategy: "inclusive",

  assigneesBinding: "board.repo.assignees",
  issuesBinding: "board.repo.issues",

  create: function(model){
    this.set("board", model);
    Ember.run.sync();

    return this.get("filters");
  },

  filters : function () {
     var filters = this.get("board.avatars").map(function(a){
       return Ember.Object.create({
         name: a.login,
         avatar : a,
         mode: 0,
         queryParam: 'assignee',
         condition: function (i) {
            if(i.data.assignees){
              return i.data.assignees.isAny("login", a.login);
            }
            return i.data.assignee && i.data.assignee.login === a.login;
         }
       });
     });
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
  }.property("board.avatars")
});

export default MemberFilters;
