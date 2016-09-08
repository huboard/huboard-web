import Ember from 'ember';

export default Ember.Component.extend({
  coupon: null,
  customer: Ember.computed.alias('model.details.card.customer'),
  isDisabled: Ember.computed('errors', function() {
    return this.get('errors') || this.get('processingAction');
  }),
  processingAction: false,
  onCouponChange: Ember.observer('coupon', function() {
    var errors;
    errors = this.get('errors');
    if (errors) {
      return this.set('errors', null);
    }
  }),
  ajax: function(url, data, verb) {
    var controller;
    controller = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      var hash;
      hash = {};
      hash.url = url;
      hash.type = verb || 'GET';
      hash.context = controller;
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
  didRejectCoupon: function(error) {
    this.set('errors', JSON.parse(error.responseText).error.message);
    return this.set('processingAction', false);
  },
  didAcceptCoupon: function(response) {
    this.send('close');
    this.set('processingAction', false);
    return this.set('model.details.discount', response.discount);
  },
  clearCouponAlerts: function() {
    return this.set('errors', null);
  },
  actions: {
    apply_coupon: function() {
      var coupon_id, customer;
      coupon_id = this.get('coupon');
      customer = this.get('customer');
      this.set('processingAction', true);
      return this.ajax("/settings/redeem_coupon/" + customer, {
        coupon: coupon_id
      }, "PUT").then(this.didAcceptCoupon.bind(this), this.didRejectCoupon.bind(this));
    },
    couponChanged: function() {
      var coupon_id, success;
      coupon_id = this.get('coupon');
      if (coupon_id === "") {
        return this.clearCouponAlerts();
      }
      return this.ajax("/settings/coupon_valid/" + coupon_id, {}, "GET").then(success = (function() {}), this.didRejectCoupon.bind(this));
    },
    close: function() {
      return this.sendAction("close");
    }
  }
});
