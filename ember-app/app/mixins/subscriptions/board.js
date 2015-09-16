import Ember from 'ember';
import Issue from 'app/models/new/issue';

var BoardSubscriptionMixin = Ember.Mixin.create({
  initSubscribers: function(){
    var _self = this;
    Ember.run.next(() => {
      var repos = _self.get("model.board.repos");
      if(!repos) { return; }
      repos.forEach(function(repo){
        var newIssue = `${repo.data.repo.full_name} issues.*.issue_opened`;
        _self.hbsubscriptions[newIssue] = "newIssue";
      });

      _self.unsubscribeFromMessages();
      _self.subscribeToMessages();
    });
  }.observes("model.board.repos.[]"),
  hbsubscriptions: {
    channel: "{model.repo.data.repo.full_name}",
    "milestones.*.milestone_created": "newMilestone"
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
      var milestones = this.get("model.board.milestones");
      milestones.pushObject(message.milestone);
    },
  }
});

export default BoardSubscriptionMixin;
