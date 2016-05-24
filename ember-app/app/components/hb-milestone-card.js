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
  columnIndicator: function(){
    let currentState = get(this, 'issue.current_state');
    var columns = this.get('taskColumns').map((c) => {
      return Ember.Object.create({
        index: get(c, 'data.index'),
        selected: get(c, 'data.index') == get(currentState, 'index'),
        name: get(currentState, 'text')
      })
    });

    takeWhile(columns, (x) => {return !get(x, 'selected');})
      .forEach((x) => { set(x, 'selected', true); })

    return columns;

  }.property('issue.data.current_state', 'taskColumns')
});

export default HbMilestoneCard;
