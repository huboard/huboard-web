import Ember from 'ember';
import CreditCardForm from './credit-card-form';

export default CreditCardForm.extend({
  coupon: null,
  isDisabled: Ember.computed('isProcessing', 'errors', function() {
    return this.get('isProcessing') || this.get('errors');
  }),
  clearErrors: Ember.observer('number', 'cvc', 'expMonth', 'expYear', function() {
    this.set('errors', null);
  }),
  onCouponChange: Ember.observer('coupon', function() {
    const errors = this.get('errors');
    if (errors) {
      return this.set('errors', null);
    }
  }),
  price: Ember.computed('plan.amount', function() {
    return this.get('model.amount');
  }),
  didProcessToken(status, response) {
    if (response.error) {
      this.set('processingCard', false);
      return this.set('errors', response.error.message);
    } else {
      return this.postCharge(response);
    }
  },
  postCharge(token) {
    return this.ajax('/settings/charge/' + this.get('model.org.login'), {
      email: this.get('model.org.billing_email'),
      card: token,
      coupon: this.get('coupon'),
      plan: this.get('model.plan'),
    }).then(this.didPurchase.bind(this), this.purchaseDidError.bind(this));
  },
  didPurchase(response) {
    if (this.get('trialing')) {
      this.set('plan.status', 'purchase_with_trial');
    } else {
      this.set('plan.status', 'active');
    }

    this.set('processingCard', false);
    this.set('model.details.account_email', this.get('model.org.billing_email'));
    this.set('model.details.card', response.card);
    this.set('model.details.discount', response.discount);
    this.set('model.plan.purchased', true);
    this.set('model.details.has_plan', true);
    return this.sendAction('close');
  },
  purchaseDidError(error) {
    this.set('errors', JSON.parse(error.responseText).error.message);
    return this.set('processingCard', false);
  },
  didRejectCoupon(error) {
    return this.set('errors', JSON.parse(error.responseText).error.message);
  },
  clearCouponAlerts() {
    return this.set('errors', null);
  },
  ajax(url, data, verb) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      var hash;
      hash = {};
      hash.url = url;
      hash.type = verb || 'POST';
      hash.context = this;
      hash.data = data;
      hash.success = function(json) {
        return resolve(json);
      };
      hash.error = function(jqXHR) {
        return reject(jqXHR);
      };
      return Ember.$.ajax(hash);
    });
  },
  plan: Ember.computed('model.details.plans', function() {
    let plans = this.get("model.details.plans");
    this.set("model.details.plans", Ember.A(plans));
    return this.get("model.details.plans.firstObject");
  }),
  trialing: Ember.computed('plan.status', 'trialExpired', function() {
    return this.get('plan.status') === 'trialing' && !this.get('trialExpired');
  }),
  trialExpired: Ember.computed('plan.trial_end', function() {
    const end_time = new Date(this.get('plan.trial_end') * 1000);
    let now = new Date();
    return (end_time - now) < 1;
  }),
  actions: {
    couponChanged() {
      const coupon_id = this.get('coupon');
      if (coupon_id === "") {
        return this.clearCouponAlerts();
      }

      return this.ajax('/settings/coupon_valid/' + coupon_id, {}, "GET").then(() => {}, this.didRejectCoupon.bind(this));
    },
    close() {
      return this.sendAction('close');
    }
  }
});
