import Ember from 'ember';

export default Ember.Component.extend({
  processingAction: false,
  actions: {
    close() {
      return this.sendAction("close");
    },
    cancel() {
      this.set('processingAction', true);
      return this.ajax("/settings/profile/" + this.get("model.org.login") + "/plans/" + this.get('model.plan.id'), {}).then(this.didCancel.bind(this), this.cancelDidError.bind(this));
    }
  },
  didCancel() {
    this.set('model.details.plans.firstObject.status', 'inactive');
    this.set('model.details.trial', "expired");
    this.set('model.details.has_plan', false);
    this.set('model.details.discount', null);
    this.set('processingAction', false);
    this.set("model.plan.purchased", false);
    this.set("model.details.card", null);
    return this.sendAction("close");
  },
  cancelDidError(error) {
    this.set('errors', error.responseJSON.error.message);
    return this.set('processingAction', false);
  },
  ajax(url, data) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let hash;
      hash = {};
      hash.url = url;
      hash.type = 'DELETE';
      hash.context = this;
      hash.data = data;
      hash.success = (json) => {
        return resolve(json);
      };
      hash.error = (jqXHR) => {
        return reject(jqXHR);
      };
      return Ember.$.ajax(hash);
    });
  }
});
