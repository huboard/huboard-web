import Ember from 'ember';

var UserFilters = Ember.Service.extend({
  filters: [],
  strategy: "inclusive",

  create: function(){
    this.set("filters", [
      Ember.Object.create({
        name: "Unassigned issues",
        queryParam: "assignee",
        mode: 0,
        condition: function(i){
          if(i.data.assignees){ return !i.data.assignees.length; }
          return !i.data.assignee;
        }
      })
    ]);

    if(App.get("loggedIn")){
      this.get("filters").insertAt(0, 
        Ember.Object.create({
          name: "Assigned to me",
          queryParam: "assignee",
          mode: 0,
          condition: function(i){
            var current_user = App.get("currentUser").login;
            if(i.data.assignees){
              return i.data.assignees.isAny("login", current_user);
            }
            return i.data.assignee && i.data.assignee.login === current_user;
          }
      }));
      this.get("filters").insertAt(1, 
        Ember.Object.create({
          name: "Assigned to others",
          queryParam: "assignee",
          mode: 0,
          condition: function(i){
            var current_user = App.get("currentUser").login;
            if(i.data.assignees){
              return i.data.assignees[0] && i.data.assignees[0].login !== current_user;
            }
            return i.data.assignee && i.data.assignee.login !== current_user;
          }
      }));
    }

    return this.get("filters");
  }
});

export default UserFilters;
