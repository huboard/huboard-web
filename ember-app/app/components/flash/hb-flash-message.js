import Ember from 'ember';

var HbFlashMessageComponent = Ember.Component.extend({
  classNames: ['hb-flash-message'],
  flashMessages: Ember.inject.service(),
  hasMessages: Ember.computed.alias("flashMessages.queue.length"),
  messageCount: 2,

  currentFlash: [],
  manageQueue: function(){
    var queue = this.get('flashMessages.queue');
    var flash = this.get('currentFlash');

    var count = this.get("messageCount");
    var index = flash.length;
    if(queue.length && queue[index] && flash.length < count){
      this.addToQueue(queue[index], flash);
    } 

    if(queue.length > count.length) {
      this.extendTimers(queue.slice(count.length));
    }
  }.observes('flashMessages.queue.[]', 'currentFlash.[]'),
  addToQueue: function(flash, current){
    var _self = this;
    flash.on('didClickDestroy', ()=> { 
      Ember.run.once(()=> {
        _self.get('flashMessages.queue').removeObject(flash);
        flash.destroy();
        _self.removeFlash(flash);
      })
    });
    flash.on('didDestroyMessage', ()=>{
      _self.timerExpired(flash);
    });
    current.unshiftObject(flash);
  },
  timerExpired: function(flash){
    var remove = this.removeFlash.bind(this);
    if(this.get("currentFlash").length === 1){
      this.$(".message").first().animate({
        'top': '-=38px'
      }, 500, ()=> remove(flash));
    } else {
      this.$(".message").last().animate({
        'top': '+=8px',
        'opacity': 'hide'
      }, 'slow', ()=>{ remove(flash)});
    }
  },
  removeFlash: function(flash){
    var current = this.get('currentFlash');
    current.removeObject(flash);
  },

  //Extends the timers if the queue is backed up
  extendTimers: function(queue){
    queue.invoke("_cancelTimer", "timer");
    queue.invoke("_cancelTimer", "exitTimer");
    queue.invoke("_setTimer", "timer", "destroyMessage", 3500);
  }
});

export default HbFlashMessageComponent;
