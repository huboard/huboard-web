import Ember from 'ember';
import sortedQueue from 'huboard-app/utilities/sorted-queue';

var CardSubscriptionMixin = Ember.Mixin.create({
  flashMessages: Ember.inject.service(),
  hbsubscriptions: {
    channel: "{repo.data.repo.full_name}",
    "issues.{data.number}.issue_status_changed": "statusChanged",
    "issues.{data.number}.issue_archived": "archived",
    "issues.{data.number}.issue_closed": "closed",
    "local.{data.number}.issue_closed": "closed",
    "issues.{data.number}.issue_reopened": "opened",
    "local.{data.number}.issue_reopened": "opened",
    "issues.{data.number}.assigned": "assigned",
    "issues.{data.number}.unassigned": "unassigned",
    "issues.{data.number}.moved": "moved",
    "issues.{data.number}.reordered": "reordered",
    "issues.{data.number}.milestone_changed": "milestoneChanged",
    "issues.{data.number}.issue_labeled": "labeled",
    "issues.{data.number}.issue_unlabeled": "unlabeled"
  },
  hbsubscribers: {
    statusChanged: function(message){
      this.set("_data", message.issue._data);
    },
    archived: function(){
      this.set('isArchived', true);
    },
    closed: function(message){
      this.set("state", message.issue.state);
    },
    opened: function(message){
     this.set("state", message.issue.state);
    },
    assigned: sortedQueue(function(message){
      var assignees = this.get("assignees");
      if(assignees && !assignees.isAny("login", message.assignee.login)){
        if(message.assignee.login){
          return this.get("assignees").pushObject(message.assignee);
        } else {
          var assignee = this.get("repo.assignees").findBy("login", message.assignee);
          return this.get("assignees").pushObject(assignee);
        }
      }
      this.set("assignee", message.issue.assignee);
    }, {time: 2000, sort: function(a,b){
      var timeA = Date.parse(a.issue.updated_at);
      var timeB = Date.parse(b.issue.updated_at);
      return timeA - timeB;
    }}),
    unassigned: sortedQueue(function(message){
      if(this.get("assignees")){
        if(message.assignee && message.assignee.login){
          this.get("assignees").removeObject(message.assignee);
        } else {
          var assignee = this.get("assignees").findBy("login", message.assignee);
          this.get("assignees").removeObject(assignee);
        }
      }
    }, {time: 2000, sort: function(a,b){
      var timeA = Date.parse(a.issue.updated_at);
      var timeB = Date.parse(b.issue.updated_at);
      return timeA - timeB;
    }}),
    moved: function (message) {
      this.setProperties({
        current_state : message.issue.current_state,
        state: message.issue.state,
        _data: message.issue._data
      });
    },
    reordered: function (message) {
       this.set("current_state", message.issue.current_state);
       this.set("_data", message.issue._data);
    },
    milestoneChanged: function(message) {
      this.setProperties({
        milestone: message.issue.milestone,
        body: message.issue.body,
        _data: message.issue._data
      });
    },
    labeled: sortedQueue(function(message) {
      if(message.label){
        var match = this.get("data.other_labels").find((label)=>{
          return label.name === message.label.name;
        });
        if(!match){ return this.get("data.other_labels").addObject(message.label); }
      }
    }, {time: 2000, sort: function(a,b){
      var timeA = Date.parse(a.issue.updated_at);
      var timeB = Date.parse(b.issue.updated_at);
      return timeA - timeB;
    }}),
    unlabeled: sortedQueue(function(message) {
      if(message.label){
        var match = this.get("data.other_labels").find((label)=>{
          return label.name === message.label.name;
        });
        if(match){
          this.get("data.other_labels").removeObject(match);
        }
      }
    }, {time: 2000, sort: function(a,b){
      var timeA = Date.parse(a.issue.updated_at);
      var timeB = Date.parse(b.issue.updated_at);
      return timeA - timeB;
    }})
  }
});

export default CardSubscriptionMixin;
