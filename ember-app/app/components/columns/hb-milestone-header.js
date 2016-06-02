import Ember from "ember";

var HbMilestoneHeaderComponent = Ember.Component.extend({
  classNames: ['hb-column-header'],
  tagName: "h3",
  attributeBindings: ["milestoneTitle:title"],
  milestoneTitle: Ember.computed.alias("column.title"),
  click: function(){
    this.toggleProperty('isCollapsed');
  },
  actions: {
    editMilestone: function(column){
      this.attrs.editMilestone(column);
    }
  }
});

export default HbMilestoneHeaderComponent;
