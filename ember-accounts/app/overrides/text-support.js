import Ember from 'ember';

export default Ember.TextSupport.reopen({
  attributeBindings: ["data-stripe", "autocomplete", "autocompletetype", "required"]
});
