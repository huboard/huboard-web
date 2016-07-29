import Ember from 'ember';

var HbFilterGroupComponent = Ember.Component.extend({
  tagName: ['ul'],
  classNames: ['filter-group'],
  classNameBindings: ['isCollapsed:collapsed'],
  isCollapsed: false,
  click: function(el){
    if(el.target.className === 'filter-header'){
      this.toggleProperty('isCollapsed');
      //save to LS
    }
  }
});

export default HbFilterGroupComponent;
