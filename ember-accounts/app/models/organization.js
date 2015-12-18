import Ember from 'ember';

export default Ember.Object.extend({
  gravatar_url: function() {
    return this.get('avatar_url');
  }.property('avatar_url'),

  loadDetails() {
    Ember.$.getJSON(`/api/profiles/${this.get('login')}`, response => {
      this.set('details', response);
      return response;
    });
  },
  loadHistory() {
    Ember.$.getJSON(`/api/profiles/${this.get('login')}/history`).then(response => {
      this.set('history', response);
      return response;
    });
  }
});
