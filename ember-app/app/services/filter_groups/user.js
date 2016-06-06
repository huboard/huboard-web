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
            return i.data.assignee && i.data.assignee.login === App.get("currentUser").login;
          }
      }));
      this.get("filters").insertAt(1, 
        Ember.Object.create({
          name: "Assigned to others",
          queryParam: "assignee",
          mode: 0,
          condition: function(i){
            return i.data.assignee && i.data.assignee.login !== App.get("currentUser").login;
          }
      }));
    }

    return this.get("filters");
  }
});

export default UserFilters;
