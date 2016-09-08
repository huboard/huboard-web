import Ember from 'ember';
import AnalyticsMixin from '../mixins/analytics';

export default Ember.Component.extend({
  active: Ember.computed('plan.status', function(){
    return this.get("plan.status") === "active";
  }),
  couponCode: Ember.computed("model.details.discount","model.details.discount.coupon", "model.details.discount.coupon.id", function(){
    return this.get("model.details.discount.coupon.id");
  }),
  errorState: Ember.computed("failure", "trialingExpired", function() {
    return this.get("failure") || this.get("trialingExpired");
  }),
  failure: Ember.computed("model.details.success",function() {
    return this.get("model.details.success") === false;
  }),
  inactive: Ember.computed('plan.status', 'model.details.trial', function() {
    let trial = this.get('model.details.trial');
    let status = this.get('plan.status');
    return (status === 'inactive' || status === 'canceled') && trial === 'expired';
  }),
  noAccount: Ember.computed('model.details.has_plan', 'model.details.trial', function(){
    var trial = this.get("model.details.trial");
    return !this.get("model.details.has_plan") && trial === "available";
  }),
  nonProfit: Ember.computed('model.details.non_profit', 'active', function(){
    return this.get("model.details.non_profit") && !this.get("plan");
  }),
  plan: Ember.computed('model.details.plans', function() {
    let plans = this.get("model.details.plans");
    this.set("model.details.plans", Ember.A(plans));
    const firstPlan = this.get("model.details.plans.firstObject");
    return firstPlan;
  }),
  purchaseWithTrial: Ember.computed('plan.status', function(){
    return this.get("plan.status") === "purchase_with_trial";
  }),
  trialExpired: Ember.computed('plan.trial_end', function(){
    var end_time = new Date(this.get("plan.trial_end") * 1000);
    var now = new Date();
    return (end_time - now) < 1;
  }),
  trialActivationUrl: Ember.computed('model.login', function(){
    const path = encodeURIComponent(window.location.pathname + window.location.hash);
    const redirect = "?forward_to=" + path;
    const user = this.get("model.login");
    return "/settings/profile/" + user + "/trial/activate"  + redirect;
  }),
  trialButtonDisabled: false,
  trialing: Ember.computed('plan.status', 'trialExpired', function(){
    return this.get("plan.status") === "trialing" && !this.get("trialExpired");
  }),
  trialingExpired: Ember.computed('active', 'inactive', 'trialExpired', function(){
    return !this.get("active") && !this.get("inactive")  && this.get("trialExpired");
  }),
  currentModal: null,
  showModal: Ember.computed('currentModal', function() {
    return !!this.get('currentModal');
  }),
  actions: {
    activateTrial() {
      this.set("trialButtonDisabled", true);
      Ember.$.ajax({
        url: this.get("trialActivationUrl"),
        data: {billing_email: this.get("emailBinding")},
        type: "POST"
      }).then(function(){
          location.reload();
      });
    },
    applyCoupon(model) {
      this.set('modalModel', model);
      this.set('currentModal', 'apply-coupon');
    },
    cancel(model) {
      const org = this.get("model.details.org");
      const details = this.get('model.details');
      const plan = Ember.Object.create({plan: model, org:org, details: details});
      this.set('modalModel', plan);
      this.set('currentModal', 'cancel-form');
    },
    closeModal() {
      // We don't want to show any type of modal.
      this.set('currentModal', null);
    },
    purchase(model) {
      const org = this.get("model.details.org");
      const details = this.get('model.details');
      const plan = Ember.Object.create({plan: model, org:org, details: details});

      this.set('modalModel', plan);
      this.set('currentModal', 'purchase-form');
    },
    updateCard(model) {
      const org = this.get("model.details.org");
      const card = Ember.Object.create({card: model, org:org});
      this.set('modalModel', card);
      this.set('currentModal', 'update-card');
    },
    updateEmail(model) {
      this.set('modalModel', model);
      this.set('currentModal', 'update-email');
    }
  }
}, AnalyticsMixin);
