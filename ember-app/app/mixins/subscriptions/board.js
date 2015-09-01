import Ember from 'ember';
import Issue from 'app/models/issue';

var BoardSubscriptionMixin = Ember.Mixin.create({
  hbsubscriptions: {
    channel: "{model.full_name}",
    "issues.*.issue_opened": "newIssue",
    "milestones.*.milestone_created": "newMilestone"
  },
  hbsubscribers: {
    newIssue: function(message) {
      var issue = this.get("model.board.issues").findBy('number', message.issue.number);
      if(issue) { return issue.set("state", "open"); }

      var _self = this;
      var number = message.issue.number;
      var repo = message.issue.repo.full_name;
      this.get("model").fetchIssue(number, repo).then(function(issue){
        var model = Issue.create(issue);
        if(model.current_state.name === "__nil__") {
          model.set("current_state", _self.get("model.board.columns.firstObject"));
        }

        _self.hbsubscribers._colorLinkedIssue.call(_self, model);
        _self.get("model.board.issues").pushObject(model);
      });
    },
    newMilestone: function(message){
      var milestones = this.get("model.board.milestones");
      milestones.pushObject(message.milestone);
    },

    _colorLinkedIssue: function(model){
      var parent_repo = this.get("model.board.repo.full_name");
      var model_repo = model.repo.full_name;
      if(parent_repo.toLowerCase() !== model_repo.toLowerCase()){
        var linked_labels = this.get("model.board.link_labels");
        var label = _.find(linked_labels, function(l){
          var name = l.user + "/" + l.repo;
          return name.toLowerCase() === model.repo.full_name.toLowerCase();
        });
        model.color = label.color;
      }
    }
  }
});

export default BoardSubscriptionMixin;
