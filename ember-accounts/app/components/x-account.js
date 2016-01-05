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
    var plans = this.get("model.details.plans");
    this.set("model.details.plans", Em.A(plans));
    return this.get("model.detail.plans.firstObject");
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
    var path = encodeURIComponent(window.location.pathname + window.location.hash);
    var redirect = "?forward_to=" + path;
    var user = this.get("model.login");
    return "/settings/profile/" + user + "/trial/activate"  + redirect;
  }.property("model.login"),
  trialButtonDisabled: false,
  trialing: function(){
    return this.get("plan.status") === "trialing" && !this.get("trialExpired");
  }.property("plan.status", "trialExpired"),
  trialingExpired: function(){
    return !this.get("active") && !this.get("inactive")  && this.get("trialExpired");
  }.property("active", "inactive", "trialExpired"),
  actions: {
    activateTrial: function(){
      self = this;
      this.set("trialButtonDisabled", true);
      Ember.$.ajax( {
        url: self.get("trialActivationUrl"),
        data: {billing_email: self.get("emailBinding")},
        type: "POST"})
        .then(function(response){
          location.reload();
        });
    },
  }
});
