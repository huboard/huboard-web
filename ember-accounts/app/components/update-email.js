import Ember from 'ember';

export default Ember.Component.extend({
  customer: Ember.computed.alias('model.details.plans.firstObject.customer'),
  onChange: Ember.observer('email', function() {
    let errors;
    errors = this.get('errors');
    if (errors) {
      this.set('errors', null);
    }
  }),
  isDisabled: function() {
    return this.get('errors') || this.get('processing');
  },
  processing: false,
  actions: {
    update() {
      this.set('processing', true);
      Ember.$.ajax({
        url: '/settings/email/' + this.get('customer'),
        data: {billing_email: this.get('email')},
        type: "PUT"
      }).then(() => {
        this.set('model.details.account_email', this.get('email'));
        this.set('processing', false);
        this.set('email', '');
        this.sendAction('close');
      }).fail(() => {
        this.set('errors', 'Your email address could not be updated, please try again.');
        this.set('processing', false);
      });
    },
    close() {
      this.sendAction('close');
    }
  }
});
