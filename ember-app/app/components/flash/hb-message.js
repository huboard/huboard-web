import Ember from 'ember';

var  HbFlashComponent = Ember.Component.extend({
  classNames: ['message'],
  classNameBindings: ['flash.id'],
  progress: Ember.computed.alias('flash.progress.status'),

  click: function(){
    if(this.get('progress')){return;}
    var flash = this.get('flash');
    flash._setTimer("timer", "destroyMessage", 0);
  },

  setMessage: function(){
    var message = this.get('flash.message');
    this.set('message', message);
  }.on('init'),

  didInsertElement: function(){
    this.$().css("margin-bottom", -38);
    this.$().animate({
      'top': '+=38px',
      'margin-bottom': '+=42px'
    }, 400);
  },
  observeProgress: function(){
    var flash = this.get('flash');
    if(!flash.progress.status && flash.progress.callback){
      flash.progress.callback.call(this);
    }
  }.observes('progress')
});

export default HbFlashComponent;
