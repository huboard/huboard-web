import Ember from 'ember';

export default Ember.TextField.extend({
  required: true,
  autocompletetype: "cc-csc",
  format: "123",
  placeholder: Ember.computed.alias("format"),
  autocomplete: "off",
  didInsertElement() {
    return this.$().payment("formatCardCVC");
  }
});
