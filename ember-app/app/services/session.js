import Ember from 'ember';

var SessionService = Ember.Service.extend({
  initEventObservers: function(){
    var _self = this;
    Ember.$(window).on('focus blur', (e)=>{
      _self[`${e.type}Handlers`].forEach((h) => _self[h]());
    });
  }.on('init')
});

export default SessionService;
