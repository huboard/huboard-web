import Ember from 'ember';

var HbPaneComponent = Ember.Component.extend({
    classNameBindings: ["selected:active"],
    classNames: ["tab-pane"],
    addPane: function(){
      Ember.run.scheduleOnce('afterRender', this, () => { this.get('parentView').addPane(this); });
    }.on('init'),
    selected: function() {
      return this.get('parentView.selected') === this;
    }.property('parentView.selected')
});

export default HbPaneComponent;
