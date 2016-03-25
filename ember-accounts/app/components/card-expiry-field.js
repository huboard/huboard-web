import Ember from 'ember';

export default Ember.TextField.extend({
  required: true,
  autocompletetype: "cc-exp",
  format: "MM / YY",
  placeholder: Ember.computed.alias("format"),
  didInsertElement() {
    return this.$().payment("formatCardExpiry");
  }
});
