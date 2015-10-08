import Ember from 'ember';

var HbFlashMessageComponent = Ember.Component.extend({
  flashMessages: Ember.inject.service()
});

export default HbFlashMessageComponent;
