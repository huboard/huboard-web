import Ember from 'ember';

var HbFilterGroupComponent = Ember.Component.extend({
  tagName: ['ul'],
  classNames: ['filter-group'],
  classNameBindings: ['isCollapsed:collapsed'],
  setCollapsedKey: function(){
    if(this.get(`settings.filters${this.get('name')}Collapsed`)){
      this.set(`settings.filters${this.get('name')}Collapsed`, false);
    }
  }.on('init'),
  isCollapsed: Ember.computer.alias(`settings.filters${this.get('name')}Collapsed`),
  click: function(el){
    if(this.$(el.target).is('.filter-header') || this.$(el.target).is('.ui-icon')){
      this.toggleProperty(`settings.filters${this.get('name')}Collapsed`);
      this.notifyPropertyChange('isCollapsed');
    }
  }
});

export default HbFilterGroupComponent;
