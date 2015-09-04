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
     var filters = this.get("avatars").map(function(a){
       return Ember.Object.create({
         name: a.login,
         avatar : a,
         mode: 0,
         condition: function (i) {
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
  }.property("avatars"),

  avatars : function () {
    var issues = this.get("issues");
    return this.get("assignees").filter(function(assignee){
      return _.find(issues, function(issue){
        return issue.data.assignee &&
          issue.data.assignee.login === assignee.login;
      });
    });
  }.property("assignees.[]", "issues.@each.assignee"),
});

export default MemberFilters;
