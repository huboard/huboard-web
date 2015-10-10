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

        var moved = `${channel} issues.*.moved`;
        _self.hbsubscriptions[moved] = "issueMoved";

        var closed = `${channel} issues.*.issue_closed`;
        _self.hbsubscriptions[closed] = "issueStateChanged";
        var opened = `${channel} issues.*.issue_reopened`;
        _self.hbsubscriptions[opened] = "issueStateChanged";

        var status = `${channel} issues.*.issue_status_changed`;
        _self.hbsubscriptions[status] = "issueStatusChanged";
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
      var copy = `${message.actor.login} moved issue #${message.issue.number} to "${message.column.text}"`;
      this.get("flashMessages").info(copy);
    },
    issueStatusChanged: function(message){
      var custom_state = message.issue._data.custom_state;
      var status = custom_state.length ? custom_state : "cleared";

      if(status === "cleared"){
        var copy = `${message.actor.login} cleared issue #${message.issue.number}'s status`;
      } else {
        var copy = `${message.actor.login} marked issue #${message.issue.number} as ${message.issue._data.custom_state}`;
      }

      this.get("flashMessages").info(copy);
    },
    issueStateChanged: function(message){
      var copy = `${message.actor.login} changed issue #${message.issue.number} to "${message.issue.state}"`;
      this.get("flashMessages").info(copy);
    }
  }
});

export default BoardSubscriptionMixin;
