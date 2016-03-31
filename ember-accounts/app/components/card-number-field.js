import Ember from 'ember';

export default Ember.TextField.extend({
  required: true,
  autocompletetype: "cc-number",
  format: "1234 5678 9012 3456",
  placeholder: Ember.computed.alias("format"),
  didInsertElement() {
    return this.$().payment("formatCardNumber");
  }
});

