import Ember from 'ember';

var BrowserSessionService = Ember.Service.extend(Ember.Evented, {
  initEventObservers: function(){
    var _self = this;
    Ember.$(window).on('focus blur', (e)=>{
      _self[`${e.type}Handlers`].forEach((h) => _self[h]());
    });
  }.on('init'),
  setLastFocus: function(){
    var before = this.get('lastBlur');
    var now = new Date().getTime();
    this.set('lastFocus', (now - before));
  }.on('didFocusBrowser'),

  //Focus Handlers
  focusHandlers: ['sendFocusEvent'],
  sendFocusEvent: function(){
    this.trigger('didFocusBrowser');
  },

  //Blur Handlers
  blurHandlers: ['updateLastBlur'],
  lastBlur: new Date().getTime(),
  updateLastBlur: function(){
    var time = new Date().getTime();
    this.set('lastBlur', time);
  }
});

export default BrowserSessionService;
