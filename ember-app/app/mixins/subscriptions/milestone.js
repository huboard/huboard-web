import Ember from 'ember';

var MilestoneSubscriptionMixin = Ember.Mixin.create({
  hbsubscriptions: {
    channel: "{model.milestone.repo.full_name}",
    "milestones.{model.milestone.number}.milestone_reordered": "reordered"
  },
  hbsubscribers: {
    reordered: function(message){
      var old_ms = this.get("model.milestone");
      var new_ms = message.milestone;
      this.sendAction("milestoneReordered", old_ms, new_ms);
    },
  }
});

export default MilestoneSubscriptionMixin;
