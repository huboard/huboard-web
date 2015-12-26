import Ember from 'ember';

export default Ember.Component.extend({
  setup: function() {
    // Did Insert Element.
    // Add this logic.
    this.get('parentView').addPane(this); 
  },
  selected: function() {
    return this.get('parentView.selected') === this;
  }.property('parentView.selected')
});
