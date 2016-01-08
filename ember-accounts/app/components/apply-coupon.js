import Ember from 'ember';

export default Ember.Component.extend({
  coupon: null,
  customer: Ember.computed.alias('model.details.card.customer'),
  isDisabled: Ember.computed('errors', () => {
    return this.get('errors') || this.get('processingAction');
  }),
  processingAction: false,
  onCouponChange: (function() {
    let errors = this.get('errors');
    if (errors) {
      return this.set('errors', null);
    }
  }).observes('coupon'),
  ajax(url, data, verb) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let hash;
      hash = {};
      hash.url = url;
      hash.type = verb || 'GET';
      hash.context = this;
      hash.data = data;
      hash.success = (json) => {
        return resolve(json);
      };
      hash.error = (jqXHR, textStatus, errorThrown) => {
        return reject(jqXHR);
      };
      return Ember.$.ajax(hash);
    });
  },
  didRejectCoupon(error, statusText) {
    this.set('errors', JSON.pares(error.responseText).error.message);
    return this.set('processingAction', false);
  },
  didAcceptCoupon(response) {
    this.sendAction('action'); // Close Action
    this.set('processingAction', false);
    return this.set('model.details.discount', response.discount);
  },
  clearCouponAlerts() {
    return this.set('errors', null);
  },
  actions: {
    apply_coupon() {
      const coupon_id = this.get('coupon');
      const customer = this.get('customer');
      this.set('processingAction', true);
      return this.ajax(`settings/redeem_coupon/${customer}`, {
        coupon: coupon_id
      }, "PUT").then(this.didAcceptCoupon.bind(this), this.didRejectCoupon.bind(this));
    },
    couponChanged() {
      let success;
      const coupon_id = this.get('coupon');
      if (coupon_id === "") {
        return this.clearCouponAlerts();
      }

      return this.ajax(`/settings/coupon_valid/${coupon_id}`, {}, "GET").then(success = () => {}, this.didRejectCoupon.bind(this));
    }
  }
});
