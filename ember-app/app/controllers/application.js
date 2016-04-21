import Ember from 'ember';
import BoardSubscriptions from "app/mixins/subscriptions/board";
import Messaging from "app/mixins/messaging";

var ApplicationController = Ember.Controller.extend(
  BoardSubscriptions, Messaging, {
  flashMessages: Ember.inject.service(),
  qps: Ember.inject.service("query-params"),
  isSidebarOpen: false,

  filters: Ember.inject.service(),
  initFilters: function(){
    if(this.get("model.board")){
      this.get("filters").set("model", this.get("model.board"));
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

  //Browser Session Checker
  boardSyncing: Ember.inject.service(),
  checkBrowserSession: function(){
    var lastFocus = this.get('browser-session.lastFocus');
    var _self = this;
    if(lastFocus >= _self.browserCheckInterval){
      var since = new Date(new Date().getTime() - _self.browserCheckInterval);
      this.validateCredentials().success((response)=>{
        _self.get('boardSyncing').syncIssues(_self.get('model.board'), {since: since.toISOString()});
      }).fail((error)=>{

      });
    }
  }.observes('browser-session.lastFocus').on('init'),
  validateCredentials: function(){
    return Ember.$.getJSON('/api/logged_in');
  },
  browserCheckInterval: 3600000//One Hour
});

export default ApplicationController;
