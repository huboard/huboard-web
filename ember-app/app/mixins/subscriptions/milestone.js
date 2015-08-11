import Ember from 'ember';

var MilestoneSubscriptionMixin = Ember.Mixin.create({
  hbsubscriptions: {
    channel: "{model.milestone.repo.full_name}",
    "milestones.*.milestone_created": "created",
    "milestones.{model.milestone.number}.milestone_reordered": "reordered"
  },
  hbsubscribers: {
    created: function(message){
      this.sendAction("milestoneCreated", message.milestone);
    },
    reordered: function(message){
      var old_ms = this.get("model.milestone");
      var new_ms = message.milestone;
      this.sendAction("milestoneReordered", old_ms, new_ms);
    },
  }
});

export default MilestoneSubscriptionMixin;
