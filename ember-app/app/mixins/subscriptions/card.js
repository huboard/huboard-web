import Ember from 'ember';
import sortedQueue from 'app/utilities/sorted-queue';

var CardSubscriptionMixin = Ember.Mixin.create({
  flashMessages: Ember.inject.service(),
  hbsubscriptions: {
    channel: "{issue.repo.data.repo.full_name}",
    "issues.{issue.data.number}.issue_status_changed": "statusChanged",
    "issues.{issue.number}.issue_archived": "archived",
    "issues.{issue.number}.issue_closed": "closed",
    "local.{issue.number}.issue_closed": "closed",
    "issues.{issue.number}.issue_reopened": "opened",
    "local.{issue.number}.issue_reopened": "opened",
    "issues.{issue.number}.assigned": "assigned",
    "issues.{issue.number}.unassigned": "unassigned",
    "issues.{issue.number}.moved": "moved",
    "issues.{issue.number}.reordered": "reordered",
    "issues.{issue.number}.milestone_changed": "milestoneChanged",
    "issues.{issue.number}.issue_labeled": "labeled",
    "issues.{issue.number}.issue_unlabeled": "unlabeled"
  },
  hbsubscribers: {
    statusChanged: function(message){
      this.get("issue").set("_data", message.issue._data);
    },
    archived: function(){
      this.get('issue').set('isArchived', true);
    },
    closed: function(message){
      this.get("issue").set("state", message.issue.state);
    },
    opened: function(message){
     this.get("issue").set("state", message.issue.state);
    },
    assigned: sortedQueue(function(message){
      var assignees = this.get("issue.assignees");
      if(assignees && !assignees.isAny("login", message.assignee.login)){
        if(message.assignee.login){
          this.get("issue.assignees").pushObject(message.assignee);
        } else {
          var assignee = this.get("issue.repo.assignees").findBy("login", message.assignee);
          this.get("issue.assignees").pushObject(assignee);
        }
      }
      this.set("issue.assignee", message.issue.assignee);
    }, {time: 2000, sort: function(a,b){
      var timeA = Date.parse(a.issue.updated_at);
      var timeB = Date.parse(b.issue.updated_at);
      return timeA - timeB;
    }}),
    unassigned: sortedQueue(function(message){
      if(this.get("issue.assignees")){
        if(message.assignee && message.assignee.login){
          this.get("issue.assignees").removeObject(message.assignee);
        } else {
          var assignee = this.get("issue.assignees").findBy("login", message.assignee);
          this.get("issue.assignees").removeObject(assignee);
        }
      }
    }, {time: 2000, sort: function(a,b){
      var timeA = Date.parse(a.issue.updated_at);
      var timeB = Date.parse(b.issue.updated_at);
      return timeA - timeB;
    }}),
    moved: function (message) {
      this.get('issue').setProperties({
        current_state : message.issue.current_state,
        state: message.issue.state,
        _data: message.issue._data
      });
    },
    reordered: function (message) {
       this.get("issue").set("current_state", message.issue.current_state);
       this.get("issue").set("_data", message.issue._data);
    },
    milestoneChanged: function(message) {
      this.get('issue').setProperties({
        milestone: message.issue.milestone,
        body: message.issue.body,
        _data: message.issue._data
      });
    },
    labeled: sortedQueue(function(message) {
      if(message.label){
        var match = this.get("issue.data.other_labels").find((label)=>{
          return label.name === message.label.name;
        });
        if(!match){ return this.get("issue.data.other_labels").addObject(message.label); }
      }
    }, {time: 2000, sort: function(a,b){
      var timeA = Date.parse(a.issue.updated_at);
      var timeB = Date.parse(b.issue.updated_at);
      return timeA - timeB;
    }}),
    unlabeled: sortedQueue(function(message) {
      if(message.label){
        var match = this.get("issue.data.other_labels").find((label)=>{
          return label.name === message.label.name;
        });
        if(match){
          this.get("issue.data.other_labels").removeObject(match);
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
