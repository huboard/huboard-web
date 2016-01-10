import Ember from 'ember';

export default Ember.Component.extend({
  active: function(){
    return this.get("plan.status") === "active";
  }.property("plan.status"),
  couponCode: function(){
    return this.get("model.details.discount.coupon.id");
  }.property("model.details.discount","model.details.discount.coupon", "model.details.discount.coupon.id"),
  errorState: function() {
    return this.get("failure") || this.get("trialingExpired");
  }.property("failure", "trialingExpired"),
  failure: function() {
    return this.get("model.details.success") === false;
  }.property("model.details.success"),
  noAccount: function(){
    var trial = this.get("model.details.trial");
    return !this.get("model.details.has_plan") && trial === "available";
  }.property("model.details.has_plan", "model.details.trial"),
  nonProfit: function(){
    return this.get("model.details.non_profit") && !this.get("plan");
  }.property("model.details.non_profit", "active"),
  plan: function() {
    let plans = this.get("model.details.plans");
    this.set("model.details.plans", Em.A(plans));
    const firstPlan = this.get("model.details.plans.firstObject");
    return firstPlan;
  }.property("model.details.plans"),
  purchaseWithTrial: function(){
    return this.get("plan.status") === "purchase_with_trial";
  }.property("plan.status"),
  trialExpired: function(){
    var end_time = new Date(this.get("plan.trial_end") * 1000);
    var now = new Date();
    return (end_time - now) < 1;
  }.property("plan.trial_end"),
  trialActivationUrl: function(){
    const path = encodeURIComponent(window.location.pathname + window.location.hash);
    const redirect = "?forward_to=" + path;
    const user = this.get("model.login");
    return "/settings/profile/" + user + "/trial/activate"  + redirect;
  }.property("model.login"),
  trialButtonDisabled: false,
  trialing: function(){
    return this.get("plan.status") === "trialing" && !this.get("trialExpired");
  }.property("plan.status", "trialExpired"),
  trialingExpired: function(){
    return !this.get("active") && !this.get("inactive")  && this.get("trialExpired");
  }.property("active", "inactive", "trialExpired"),
  currentModal: '',
  showUpdateEmailModal: Ember.computed.equal('currentModal', 'updateEmail'),
  showApplyCouponModal: Ember.computed.equal('currentModal', 'applyCoupon'),
  showCancelModal: Ember.computed.equal('currentModal', 'cancelForm'),
  showUpdateCardModal: Ember.computed.equal('currentModal', 'updateCard'),
  showPurchaseFormModal: Ember.computed.equal('currentModal', 'purchaseForm'),
  actions: {
    activateTrial() {
      this.set("trialButtonDisabled", true);
      Ember.$.ajax({
        url: this.get("trialActivationUrl"),
        data: {billing_email: this.get("emailBinding")},
        type: "POST"
      }).then(function(response){
          location.reload();
      });
    },
    applyCoupon(model) {
      this.set('currentModal', 'applyCoupon');
    },
    cancel(model) {
      const org = this.get("model.details.org");
      const details = this.get('model.details');
      const plan = Ember.Object.create({plan: model, org:org, details: details});
      this.set('planModel', plan);
      this.set('currentModal', 'cancelForm');
    },
    closeModal() {
      // We don't want to show any type of modal.
      this.set('currentModal', ''); 
    },
    purchase(model) {
      const org = this.get("model.details.org");
      const details = this.get('model.details');
      const plan = Ember.Object.create({plan: model, org:org, details: details});
      
      this.set('planModel', plan);
      this.set('currentModal', 'purchaseForm');
    },
    updateCard(model) {
      const org = this.get("model.details.org");
      const card = Ember.Object.create({card: model, org:org});
      this.set('cardModel', card);
      this.set('currentModal', 'updateCard');
    },
    updateEmail(model) {
      this.set('currentModal', 'updateEmail');
    }
  }
});
