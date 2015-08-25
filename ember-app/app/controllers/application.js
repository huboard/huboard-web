import Ember from 'ember';
import BoardSubscriptions from "app/mixins/subscriptions/board";
import Messaging from "app/mixins/messaging";

var ApplicationController = Ember.Controller.extend(
  BoardSubscriptions, Messaging, {
  qps: Ember.inject.service("query-params"),
  isSidebarOpen: false,
  filters: Ember.inject.service(),
  setFilters: function(){
    if(this.get("model.board")){
      //this.get("filters.filterGroups").setGroups(this.get("model.board"));
    }
  }.observes("model.board"),

  currentUser: function(){
    return App.get("currentUser");
  }.property("App.currentUser"),
  loggedIn: function(){
    return App.get("loggedIn");
  }.property("App.loggedIn"),

  //Fix the need to delay event subscriptions
  subscribeDisabled: true,
  initSubscribers: function(){
    if(!this.get("model.board.linkedRepos.length")){return;}

    var _self = this;
    this.get("model.board.linkedRepos").forEach(function(repo){
      var newIssue = `${repo.full_name} issues.*.issue_opened`;
      _self.hbsubscriptions[newIssue] = "newIssue";
    });

    this.unsubscribeFromMessages();
    this.subscribeToMessages();
  }.observes("model.board.linkedRepos.[]")
});

export default ApplicationController;
