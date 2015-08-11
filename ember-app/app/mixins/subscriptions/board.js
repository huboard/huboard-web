import Ember from 'ember';
import Issue from 'app/models/issue';

var BoardSubscriptionMixin = Ember.Mixin.create({
  hbsubscriptions: {
    channel: "{model.full_name}",
    "issues.*.issue_opened": "newIssue"
  },
  hbsubscribers: {
    newIssue: function(message) {
      var issue = this.get("model.board.issues").findBy('number', message.issue.number);

      if(issue) {
        issue.set("state", "open");
      } else {
        var model = Issue.create(message.issue);
        if(message.issue.current_state.name === "__nil__") {
          model.set("current_state", this.get("model.board.columns.firstObject"));
        }else {
          var column = this.get("model.board.columns").find(function(c) {
            return c.name === message.issue.current_state.name;
          });
          model.set("current_state", column);
        }
        this.hbsubscribers._colorLinkedIssue.call(this, model);
        this.get("model.board.issues").pushObject(model);
      }
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
