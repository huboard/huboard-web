import Ember from 'ember';

export default Ember.TextField.extend({
  required: false,
  format: "CODE",
  placeholder: Ember.computed.alias("format"),
  change() {
   return this.sendAction('couponChanged'); 
  }
});
