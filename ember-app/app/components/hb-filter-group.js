import Ember from 'ember';

var HbFilterGroupComponent = Ember.Component.extend({
  tagName: ['ul'],
  classNames: ['filter-group'],
  classNameBindings: ['isCollapsed:collapsed'],
  isCollapsed: false,
  click: function(el){
    if(this.$(el.target).is('.filter-header') || this.$(el.target).is('.ui-icon')){
      this.toggleProperty('isCollapsed');
      //save to LS
    }
  }
});

export default HbFilterGroupComponent;
