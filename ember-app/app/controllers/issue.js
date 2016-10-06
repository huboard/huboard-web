import Ember from 'ember';
import IssueSubscriptions from "huboard-app/mixins/subscriptions/issue";
import Messaging from "huboard-app/mixins/messaging";

var IssueController = Ember.Controller.extend(
  IssueSubscriptions, Messaging, {
  application: Ember.inject.controller(),
  //Fix the need to delay event subscriptions
  subscribeDisabled: true,

  statusChangeable: function(){
    return this.get("isCollaborator") &&
      this.get("model.data.state") !== "closed" &&
      !this.get("model.current_state.is_last");
  }.property("model.data.state", "isCollaborator"),
  isCollaborator: function(){
    return this.get("model.repo.isCollaborator");
  }.property("model.repo.isCollaborator"),
  columns: Ember.computed.alias("application.model.board.columns"),
  isReady: Ember.computed("model.customState", "model.data._data.custom_state", "model.data.other_labels.[]", {
    get: function() {
      return this.get("model.customState") === "ready";
    },
    set: function(key, value){
      if(value) {
        this.set("model.customState", "ready");
        return true; 
      } else {
        this.set("model.customState", "");
        return false;
      }
    }
  }),
  isBlocked: Ember.computed("model.customState", "model.data._data.custom_state", "model.data.other_labels.[]", {
    get: function() {
      return this.get("model.customState") === "blocked";
    },
    set: function(key, value){
      if(value) {
        this.set("model.customState", "blocked");
        return true; 
      } else {
        this.set("model.customState", "");
        return false;
      }
    }
  }),
  isClosed: function(){
    return this.get("model.data.state") === "closed";
  }.property("model.data.state"),
  actions: {
    labelsChanged: function (label, action) {
       Ember.run.once(function () {
         this.get("model").updateLabels(label, action);
       }.bind(this));
    },
    assignUsers: function(logins){
      return this.get("model").assignUsers(logins);
    },
    unassignUsers: function(logins){
      return this.get("model").unassignUsers(logins);
    },
    assignMilestone: function(milestone) {
      this.get("model").assignMilestone(this.get("model.data.number"), milestone);
    },
    submitComment: function () {
      if (this.get("processing") || this.get("isEmpty")) { 
        return; 
      }
      var comments = this.get("model.data.activities.comments");

      this.set("processing", true);

      this.get("model").submitComment(this.get("commentBody"))
        .then(function(comment){
          comments.pushObject(comment);

         Ember.run.once(function () {
            this.set("commentBody", "");
            this.set("processing", false);
         }.bind(this));

          return comment;
         }.bind(this));
    },
    close: function(){
      var _self = this;
      this.set("processing", true);
      this.get("model").closeAndMove().then(function(response){
        var channel = _self.hbsubscriptions.channel;
        var topic = "local.{model.data.number}.issue_closed";
        _self.publish(channel, topic, {issue: response});
        _self.set("processing", false);
        if (_self.get("commentBody")){ _self.send("submitComment"); }
      });

    },
    reopenCard: function(){
      var issue = this.get("model");
      var last_column = issue.get("repo.board.columns.lastObject");
      if(issue.get("current_state.name") !== last_column.data.name){
        issue.reorder(issue.get("order"), last_column);
      }

      var _self = this;
      this.set("processing", true);
      this.get("model").reopenIssue().then(function(response){
        var channel = _self.hbsubscriptions.channel;
        var topic = "local.{model.data.number}.issue_reopened";
        _self.publish(channel, topic, {issue: response});
        _self.set("processing", false);
        if (_self.get("commentBody")){ _self.send("submitComment"); }
      });
    }
  },
  commentBody: null,
  isEmpty: function(){
    return Ember.isBlank(this.get('commentBody'));
  }.property('commentBody'),
  isValid: function () {
    return this.get("commentBody");
  }.property("commentBody"),
  disabled: function () {
      return this.get("processing") || !this.get("isValid") || this.get('isEmpty');
  }.property("processing","isValid"),
  _events : function () {
     var events = this.get("model.data.activities.events");
     return events.map(function (e){return _.extend(e, {type: "event" }); });
  }.property("model.data.activities.events.[]"),
  _comments : function () {
     var comments = this.get("model.data.activities.comments");
     return comments.map(function (e){ return _.extend(e, {type: "comment" }); });
  }.property("model.data.activities.comments.[]"),
  allActivities: Ember.computed.union("model.data.activities.{comments,events}"),
  activitiesSort:["created_at"],
  sortedActivities: Ember.computed.sort("allActivities", "activitiesSort"),
  mentions: function (){
    var union = _.union(this.get('model.repo.assignees.[]'),this.get('allActivities').mapBy('user'));
    return _.uniq(_.compact(union), function(i){
      return i.login;
    });
  }.property('model.repo.assignees.[]','allActivities'),
  assigneesEnabled: Ember.computed.bool('model.assignees')
});

export default IssueController;
