import Ember from 'ember';
import Model from '../model';
import correlationId from 'app/utilities/correlation-id';

var Issue = Model.extend({
  columnIndex: Ember.computed.alias("data.current_state.index"),
  order: Ember.computed.alias("data._data.order"),
  milestoneOrder: Ember.computed.alias("data._data.milestone_order"),
  milestoneTitle: Ember.computed.alias("milestone.title"),
  correlationId: correlationId
});

export default Issue;
