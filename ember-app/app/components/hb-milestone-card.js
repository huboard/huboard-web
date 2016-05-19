import HbCard from "../components/hb-task-card";
import Ember from "ember";

var get = Ember.get;

var HbMilestoneCard = HbCard.extend({
  classNames: ["card", "card--milestone"],
  columnIndicator: function(){
    let currentState = get(this, 'issue.current_state');
    return this.get('taskColumns').map((c) => {
      return Ember.Object.create({
        index: get(c, 'data.index'),
        selected: get(c, 'data.index') == get(currentState, 'index'),
        name: get(currentState, 'text')
      })
    });
  }.property('issue.data.current_state', 'taskColumns')
});

export default HbMilestoneCard;
