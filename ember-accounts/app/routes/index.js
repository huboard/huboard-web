import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    let model = this.modelFor('application');
    return model.user;
  },

  afterModel(model) {
    return model.loadDetails().then(function() {
      return model.loadHistory();
    });
  }
});
