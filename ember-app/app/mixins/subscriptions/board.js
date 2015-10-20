import Ember from 'ember';
import Issue from 'app/models/new/issue';
import Milestone from 'app/models/new/milestone';

var BoardSubscriptionMixin = Ember.Mixin.create({
  initSubscribers: function(){
    var _self = this;
    Ember.run.next(() => {
      var repos = _self.get("model.board.repos");
      if(!repos) { return; }
      repos.forEach(function(repo){
        var channel = repo.data.repo.full_name;

        var newIssue = `${channel} issues.*.issue_opened`;
        _self.hbsubscriptions[newIssue] = "newIssue";

        var newMilestone = `${channel} milestones.*.milestone_created`;
        _self.hbsubscriptions[newMilestone] = "newMilestone";

        var issues = {
          "moved": "issueMoved",
          "assigned": "issueAssigned",
          "issue_closed": "issueClosed",
          "issue_reopened": "issueReopened",
          "issue_status_changed": "issueStatusChanged",
          "issue_archived": "issueArchived",
          "milestone_changed": "issueMsChanged",
          "issue_commented": "issueCommented",
          "issue_labeled": "issueLabeled"
        };
        _.each(issues, function(handler, subscriber){
          var path = `${channel} issues.*.${subscriber}`;
          _self.hbsubscriptions[path] = handler;
        });
      });

      _self.unsubscribeFromMessages();
      _self.subscribeToMessages();
    });
  }.observes("model.board.repos.[]"),
  hbsubscriptions: {
    channel: "{model.data.repo.full_name}",
    "milestones.*.milestone_created": "newMilestone",
  },
  hbsubscribers: {
    newIssue: function(message) {
      var number = message.issue.number;
      var issue = this.get("model.board.issues").findBy('number', number);
      if(issue) { return issue.set("state", "open"); }

      var message_repo = message.issue.repo.full_name;
      var repo = this.get("model.repos").find((repo) => {
        return repo.data.repo.full_name === message_repo;
      });

      var _self = this;
      repo.fetchIssue(number).then((issue) => {
        var model = Issue.create({data: issue, repo: repo});
        if(model.get("current_state.name") === "__nil__") {
          var column = _self.get("model.columns.firstObject");
          model.set("current_state", column);
        }
        repo.get("issues").pushObject(model);
      });
    },
    newMilestone: function(message){
      var repo = this.get("model.repos").find((r) => {
        return r.data.repo.full_name === message.milestone.repo.full_name;
      });

      var milestones = repo.get("milestones");
      milestones.pushObject(Milestone.create({
        data: message.milestone,
        repo: repo
      }));
    },
    issueMoved: function(message){
      var copy = `${message.actor.login} moved #${message.issue.number} from ${message.previous.text} to ${message.column.text}`;
      this.get("flashMessages").info(copy);
    },
    issueStatusChanged: function(message){
      var copy = `${message.actor.login} changed the status of #${message.issue.number} to ${message.action}`;
      this.get("flashMessages").info(copy);
    },
    issueClosed: function(message){
      var copy = `${message.actor.login} closed #${message.issue.number}`;
      this.get("flashMessages").info(copy);
    },
    issueReopened: function(message){
      var copy = `${message.actor.login} reopened #${message.issue.number}`;
      this.get("flashMessages").info(copy);
    },
    issueArchived: function(message){
      var copy = `${message.actor.login} archived #${message.issue.number}`;
      this.get("flashMessages").info(copy);
    },
    issueAssigned: function(message){
      var actor = message.actor.login;
      var assignee = message.issue.assignee;

      if(assignee){
        var copy = `${actor} assigned #${message.issue.number} to ${assignee.login}`;
      } else {
        var copy = `${actor} unassigned #${message.issue.number}`;
      }

      this.get("flashMessages").info(copy);
    },
    issueMsChanged: function(message){
      var actor = message.actor.login;
      var milestone = message.issue.milestone;

      if(milestone){
        var copy = `${actor} changed milestone of #${message.issue.number} to ${milestone.title}`;
      } else {
        var copy = `${actor} changed milestone of #${message.issue.number} to _nil_`;
      }

      this.get("flashMessages").info(copy);
    },
    issueCommented: function(message){
      var copy = `${message.actor.login} commented on issue #${message.issue.number}`;
      this.get("flashMessages").info(copy);
    },
    issueLabeled: function(message){
      return;
      var copy = `${message.actor.login} updated #${message.issue.number}`;
      this.get("flashMessages").info(copy);
    }
  }
});

export default BoardSubscriptionMixin;
