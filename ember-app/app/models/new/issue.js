import Ember from 'ember';
import Model from '../model';
import correlationId from 'app/utilities/correlation-id';

var Issue = Model.extend({
  columnIndex: Ember.computed.alias("data.current_state.index"),
  order: Ember.computed.alias("data._data.order"),
  milestoneOrder: Ember.computed.alias("data._data.milestone_order"),
  milestoneTitle: Ember.computed.alias("milestone.title"),
  correlationId: correlationId,
  assignee: Ember.computed.alias("data.assignee"),

  loadDetails: function () {
    this.set("processing", true);
    var user = this.get("data.repo.owner.login"),
    repo = this.get("data.repo.name"),
    full_name = user + "/" + repo;

    return Ember.$.getJSON("/api/" + full_name + "/issues/" + this.get("data.number") + "/details")
    .success(function(details){
      this.set("data.repo", details.repo);
      this.set("activities", details.activities);
      this.set("processing", false);
    }.bind(this)).fail(function(){
      this.set("processing", false);
    }.bind(this));
  },
});

export default Issue;
