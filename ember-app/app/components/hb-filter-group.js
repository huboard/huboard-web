import Ember from 'ember';

var HbFilterGroupComponent = Ember.Component.extend({
  tagName: ['ul'],
  classNames: ['filter-group'],
  classNameBindings: ['isCollapsed:collapsed'],
  setCollapsedKey: function(){
    if(!this.get(`settings.filters${this.get('name')}Collapsed`)){
      this.set(`settings.filters${this.get('name')}Collapsed`, false);
    }
  }.on('init'),
  isCollapsed: function(){
    return this.get(`settings.filters${this.get('name')}Collapsed`);
  }.property(''),
  click: function(el){
    if(this.$(el.target).is('.filter-header') || this.$(el.target).is('.ui-icon')){
      this.toggleProperty(`settings.filters${this.get('name')}Collapsed`);
      this.notifyPropertyChange('isCollapsed');
    }
  },
  activeFilters: Ember.computed.filter('filters', (filter)=>{
    return filter.mode > 0;
  }).property('filters.@each.mode')
});

export default HbFilterGroupComponent;
