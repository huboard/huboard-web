import Ember from "ember";

var HbTaskHeaderComponent = Ember.Component.extend({
  classNames: ['hb-column-header'],
  tagName: "h3",
  click: function(){
    this.toggleProperty('isCollapsed');
  }
});

export default HbTaskHeaderComponent;
