import HbCard from "../components/hb-task-card";
import Ember from "ember";

var { get } = Ember;

var HbMilestoneCard = HbCard.extend({
  classNames: ["card", "card--milestone"],
  taskCard: false,
  maxPowerBarLength: 4,
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

    var selected = columns.findBy('selected');
    var selectedIndex = columns.indexOf(selected);
    var powerBarLength = columns.length <= this.maxPowerBarLength ? columns.length - 1 : this.maxPowerBarLength;
    var visible_columns = columns.slice(0, powerBarLength);

    // Calculate the powerbar progress proportionally
    visible_columns = this.proportionalProgress(visible_columns, selectedIndex, columns.length, powerBarLength);

    return visible_columns;
  }.property('issue.data.current_state', 'taskColumns'),
  proportionalProgress: function(columns, selectedIndex, totalColumnCount, powerBarLength){
    // In first column, no bars are selected
    if(!selectedIndex){
      columns.setEach('selected', false);
      return columns;
    }

    // In last column, all bars are selected
    if(selectedIndex === (totalColumnCount - 1)){
      columns.setEach('selected', true);
      return columns;
    }

    // Otherwise calculate the proportional progress of the meter
    var percentComplete = selectedIndex / (totalColumnCount - 1);
    var proportionalColumnIndex = Math.ceil(percentComplete * (powerBarLength - 1)) - 1;

    return columns.map((column, index)=>{
      column.set('selected', index <= proportionalColumnIndex);
      return column;
    });
  },
  assigneeOverflow: Ember.computed('visibleAssignees.[]', {
    get() {
      var assignees = this.get('visibleAssignees') || [];
      return assignees.slice(3).length;
    }
  }),
  limitedAssignees: function(){
    var assignees = this.get('visibleAssignees') || [];
    return assignees.slice(0,3);
  }.property('visibleAssignees.[]'),
});

export default HbMilestoneCard;
