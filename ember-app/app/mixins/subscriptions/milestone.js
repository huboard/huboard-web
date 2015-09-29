import Ember from 'ember';

var MilestoneSubscriptionMixin = Ember.Mixin.create({
  hbsubscriptions: {
    channel: "{model.milestone.repo.data.repo.full_name}",
    "milestones.{model.milestone.number}.milestone_reordered": "reordered"
  },
  hbsubscribers: {
    reordered: function(message){
      this.set("model.milestone.data", message.milestone);
    },
  }
});

export default MilestoneSubscriptionMixin;
