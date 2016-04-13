import Ember from 'ember';

var HbFlashMessageComponent = Ember.Component.extend({
  classNames: ['hb-flash-message'],
  flashMessages: Ember.inject.service(),
  messageMax: 2,
  timer: 2750,

  currentFlash: [],
  processQueue: function(){
    var queue = this.get('flashMessages.queue');
    var max = this.get("messageMax")
    var current = this.get('currentFlash');

    var _self = this;
    queue.forEach((flash, index)=> {
      if(current.length < max && !current.contains(flash)){
        _self.addToQueue(flash, current);
      } else if(index > max) {
        _self.resetTimer(flash, this.get('timer') * 2);
      }
    });
  }.observes('flashMessages.queue.[]', 'currentFlash.[]'),
  addToQueue: function(flash, current){
    var _self = this;
    flash.id = _.uniqueId('flash');
    flash.on('didDestroyMessage', ()=>{
      _self.scheduleRemove(flash);
    });

    var first = current.get('lastObject');
    if(first && !first.isDestroying){
      this.resetTimer(first, this.get('timer') / 2);
    }
    this.resetTimer(flash, this.get('timer'));

    var index = this.determineIndex(flash);
    current.insertAt(index, flash);
  },
  scheduleRemove: function(flash){
    var current = this.get('currentFlash');
    var callback = function(){
      current.removeObject(flash);
      this.set("removingFlash", false);
    }.bind(this);

    if(this.get("removingFlash")){
      Ember.run.later(this, ()=> {
        this.scheduleRemove(flash)
      }, 400);
    } else { this.removeFlash(flash, callback); }
  },
  removeFlash: function(flash, callback){
    this.set("removingFlash", true);
    if(this.get("currentFlash").indexOf(flash) === 0){
      return this.$(".message").first().animate({
        'top': '-=38px'
      }, 400, callback);
    }
    this.$(`.message.${flash.id}`).first().animate({
      'top': '+=8px',
      'opacity': 'hide'
    }, 400, callback);
  },
  resetTimer: function(flash, time){
    if(flash.get('sticky')){ return; }
    flash._cancelTimer("timer");
    flash._cancelTimer("exitTimer");
    flash._setTimer("timer", "destroyMessage", time);
  },
  determineIndex: function(flash){
    var current = this.get('currentFlash');
    var sticky = current.find((f)=> {return f.sticky});
    if(sticky){
      return current.indexOf(sticky) + 1;
    }
    return 0;
  }
});

export default HbFlashMessageComponent;
