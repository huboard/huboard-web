import HbCard from "../components/hb-task-card";
import Ember from "ember";

var { get } = Ember;

var HbMilestoneCard = HbCard.extend({
  classNames: ["card", "card--milestone"],
  taskCard: false,
  powerBarLength: 4,
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
    var powerbar_total = columns.indexOf(selected);
    var visible_columns = columns.slice(0, this.powerBarLength);

    // Calculate the powerbar progress proportionally
    visible_columns = this.proportionalProgress(visible_columns, powerbar_total, columns.length);

    return visible_columns;
  }.property('issue.data.current_state', 'taskColumns'),
  proportionalProgress: function(columns, powerbar_total, total_length){
    // If powerbar is on first column, as meters are empty
    if(!powerbar_total){ columns.setEach('selected', false); return columns; }

    // If powerbar is on last column, all meters are full
    if(powerbar_total === (total_length - 1)){
      columns.setEach('selected', true);
      return columns;
    }

    // Otherwise calculate the proportional progress of the meter
    var percent_complete = powerbar_total / total_length;
    var selected_columns_index = Math.ceil(percent_complete * this.powerBarLength) - 1;

    return columns.map((column, index)=>{
      if(index <= selected_columns_index && index !== (columns.length - 1)){
        return column.set('selected', true);
      } else {
        return column.set('selected', false);
      }
    });
  },
  limitedAssignees: function(){
    var assignees = this.get('visibleAssignees') || [];
    this.set('assigneeOverflow', assignees.slice(3).length);
    return assignees.slice(0,3);
  }.property('visibleAssignees.[]'),
});

export default HbMilestoneCard;
