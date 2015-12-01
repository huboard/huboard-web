import Ember from 'ember';

var HbLabel = Ember.Component.extend({
  classNames: ["hb-label-container"],
  classNameBindings: ["selected"],
  attributeBindings: ["label.color:data-color"],
  selected: false,
  click: function(){
    this.toggleProperty("selected");
    this.clickHandler(this.get("label"), this.get("selected"));
  }
});

export default HbLabel;

