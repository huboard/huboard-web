import HbCard from "../components/hb-task-card";
import Ember from "ember";

var { get, set } = Ember;

var takeWhile = function(list, callback, context) {
  var xs = [];
  _.any(list, function(item, index, list){
    var result = callback.call(context, item, index, list);
    if(result){
      xs.push(item);
      return false;
    } else {
      return true;
    }
  });
  return xs;
};

var HbMilestoneCard = HbCard.extend({
  classNames: ["card", "card--milestone"],
  taskCard: false,
  columnIndicator: function(){
    let currentState = get(this, 'issue.current_state');
    var columns = this.get('taskColumns').map((c) => {
      return Ember.Object.create({
        index: get(c, 'data.index'),
        /* jshint ignore:start */
        // For now, I'm ok with matching "1" to 1, need to look this over and make sure
        // columns are true index based
        selected: get(c, 'data.index') == get(currentState, 'index'),
        /* jshint ignore:end */
        name: get(currentState, 'text')
      });
    });

    takeWhile(columns, (x) => {return !get(x, 'selected');}, this)
      .forEach((x) => { set(x, 'selected', true); });

    return columns;
  }.property('issue.data.current_state', 'taskColumns'),
  limitedAssignees: function(){
    var assignees = this.get('visibleAssignees') || [];
    this.set('assigneeOverflow', assignees.slice(2).length);
    return assignees.slice(0,3);
  }.property('visibleAssignees.[]')
});

export default HbMilestoneCard;
