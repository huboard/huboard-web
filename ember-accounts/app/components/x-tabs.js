import Ember from 'ember';

export default Ember.Component.extend({
  setup: function() {
    this.panes = []; 
  }.on('init'),
  addPane(pane) {
    if (this.get('panes.length') === 0) {
      this.select(pane);
    }

    this.panes.pushObject(pane);
  },
  select(pane) {
    this.set('selected', pane);
  }
});
