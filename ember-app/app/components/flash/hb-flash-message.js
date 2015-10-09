import Ember from 'ember';
import { debouncedObserver } from 'app/utilities/observers';

var HbFlashMessageComponent = Ember.Component.extend({
  classNames: ['hb-flash-message'],
  flashMessages: Ember.inject.service(),
  hasMessages: Ember.computed.alias("flashMessages.queue.length"),

  currentFlash: null,
  manageQueue: function(){
    var queue = this.get('flashMessages.queue');
    var flash = this.get('currentFlash');

    if(!flash && queue.length){
      queue[0].on('didDestroyMessage', this.removeFlash.bind(this));
      this.set('currentFlash', queue[0]);
    } else if(queue.length > 1) {
      this.extendTimers(queue.slice(1));
   }
  }.observes('flashMessages.queue.[]', 'currentFlash'),
  removeFlash: function(){
    var clearFlash = this.clearFlash.bind(this);
    this.$().animate({
      'top': '-=38px'
    }, 500, clearFlash);
  },
  //Clears the flash to signal the next message in the queue
  clearFlash: function(){
    this.set('currentFlash', null);
  },
  //Extends the timers if the queue is backed up
  extendTimers: function(queue){
    queue.invoke("_cancelTimer", "timer");
    queue.invoke("_cancelTimer", "exitTimer");
    queue.invoke("_setTimer", "timer", "destroyMessage", 5000);
  },

  actions: {
    addFlash: function(){
      this.$().animate({
        'top': '+=38px'
      }, 500);
    }
  }
});

export default HbFlashMessageComponent;
