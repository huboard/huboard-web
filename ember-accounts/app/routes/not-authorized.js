import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    const model = this.modelFor('application');

    return model;
  }
});
