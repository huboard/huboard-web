import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    let profiles = this.modelFor("application");
    return profiles.orgs.find(function(item) {
      return item.login === params.profile_id;
    });
  },
  serialize(model) {
    return {
      profile_id: model.get("login")
    };
  },
  afterModel(model) {
    if (!model) {
      // Model doesn't exist, so therefore the user doesn't have the authorized
      // access to this model.
      this.transitionTo('not-authorized');
    }

    return model.loadDetails().then(function() {
      return model.loadHistory();
    });
  }
});
