import Ember from 'ember';
import Issue from 'huboard-app/models/new/issue';
import Milestone from 'huboard-app/models/new/milestone';
import sortedQueue from 'huboard-app/utilities/sorted-queue';

var BoardSubscriptionMixin = Ember.Mixin.create({
  flashMessages: Ember.inject.service(),
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
          "unassigned": "issueUnassigned",
          "issue_closed": "issueClosed",
          "issue_reopened": "issueReopened",
          "issue_status_changed": "issueStatusChanged",
          "issue_archived": "issueArchived",
          "milestone_changed": "issueMsChanged",
          "issue_commented": "issueCommented",
          "issue_labeled": "issueLabeled",
          "issue_unlabeled": "issueUnlabeled"
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
        var model = Issue.create({data: issue, repo: repo, socket: repo.socket, filters: repo.filters});
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
    issueAssigned: sortedQueue(function(message){
      var actor = message.actor.login;
      var assignee = message.assignee.login ? message.assignee.login : message.assignee;

      var copy = `${actor} assigned #${message.issue.number} to ${assignee}`;
      this.get("flashMessages").info(copy);
    }, {time: 5000}),
    issueUnassigned: sortedQueue(function(message){
      var actor = message.actor.login;
      var assignee = message.assignee ? message.assignee : "someone";
      assignee = assignee.login ? assignee.login : assignee;

      var copy = `${actor} unassigned ${assignee} from #${message.issue.number}`;
      this.get("flashMessages").info(copy);
    }, {time: 5000}),
    issueMsChanged: function(message){
      if (message.suppress) { return; }

      var actor = message.actor.login;
      var milestone = message.issue.milestone;
      var title = milestone ? milestone.title : 'No Milestone';

      var copy = `${actor} changed milestone of #${message.issue.number} to ${title}`;

      this.get("flashMessages").info(copy);
    },
    issueCommented: function(message){
      var copy = `${message.actor.login} commented on issue #${message.issue.number}`;
      this.get("flashMessages").info(copy);
    },
    issueLabeled: sortedQueue(function(message) {
      var copy = `${message.actor.login} changed #${message.issue.number}'s labels`;
      this.get("flashMessages").info(copy);
    }, {time: 5000}),
    issueUnlabeled: sortedQueue(function(message) {
      var copy = `${message.actor.login} changed #${message.issue.number}'s labels`;
      this.get("flashMessages").info(copy);
    }, {time: 5000}) 
  }
});

export default BoardSubscriptionMixin;
