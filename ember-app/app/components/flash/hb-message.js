import Ember from 'ember';
import { debouncedObserver } from 'app/utilities/observers';

var  HbFlashComponent = Ember.Component.extend({
  classNames: ['message'],

  click: function(){
    this.get('flash').destroyMessage();
  },

  animate: function(){
    this.attrs.addFlash();
  }.observes("message").on("didInsertElement"),
});

export default HbFlashComponent;
