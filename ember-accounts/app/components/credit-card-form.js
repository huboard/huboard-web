import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    close() {
      return this.sendAction('close');
    },
    process() {
      this.set('processingCard', true);
      Stripe.setPublishableKey(this.get('key'));
      return Stripe.card.createToken({
        number: this.get('number'),
        cvc: this.get('cvc'),
        exp_month: this.get('expMonth'),
        exp_year: this.get('expYear')
      }, this.didProcessToken.bind(this));
    }
  },
  key: '1234567', //HuboardEnv.stripe_pub_key,
  processingCard: false,
  number: null,
  cvc: null,
  exp: null,
  expMonth: function() {
    if (this.get("exp")) {
      return Ember.$.payment.cardExpiryVal(this.get("exp")).month || "MM";
    }
  }.property('exp'),
  expYear: function() {
    if (this.get("exp")) {
      return Ember.$.payment.cardExpiryVal(this.get("exp")).year || "YYYY";
    }

    return "YYYY";
  }.property('exp'),
  cardType: function() {
    return Ember.$.payment.cardType(this.get('number'));
  }.property('number')
});
