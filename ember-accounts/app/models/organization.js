import Ember from 'ember';

export default Ember.Object.extend({
  gravatar_url: Ember.computed('avatar_url', function() {
    return this.get('avatar_url');
  }),
  loadDetails() {
    return Ember.$.getJSON(`/api/profiles/${this.get('login')}`, response => {
      this.set('details', response);
      return response;
    });
  },
  loadHistory() {
    return Ember.$.getJSON(`/api/profiles/${this.get('login')}/history`).then(response => {
      this.set('history', response);
      return response;
    });
  }
});
