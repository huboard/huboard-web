import Ember from 'ember';
import BoardSubscriptions from "huboard-app/mixins/subscriptions/board";
import Messaging from "huboard-app/mixins/messaging";
import { throttledObserver } from 'huboard-app/utilities/observers';

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
  checkBrowserSession: throttledObserver(function(){
    var lastFocus = this.get('browser-session.lastFocus');
    if(lastFocus >= 30000){
      var since = new Date(new Date().getTime() - lastFocus);
      return this.get('boardSyncing').syncIssues(this.get('model.board'), {since: since.toISOString()});
    }

    if(lastFocus >= 8.64e+7){ //One Day
      this.send('sessionErrorHandler');
    }
  },'browser-session.lastFocus', 30000).on('init')
});

export default ApplicationController;
