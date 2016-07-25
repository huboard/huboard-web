import Ember from 'ember';

var HbFilterGroupComponent = Ember.Component.extend({
  classNames: ['filter-group'],
  classNameBindings: ['isCollapsed:collapsed'],
  isCollapsed: true,
  click: function(){
    this.toggleProperty('isCollapsed');
  }
});

export default HbFilterGroupComponent;
