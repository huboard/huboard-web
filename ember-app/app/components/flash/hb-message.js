import Ember from 'ember';

var  HbFlashComponent = Ember.Component.extend({
  classNames: ['message'],

  click: function(){
    var _self = this;
    this.$().fadeOut("fast", ()=>{
      _self.get('flash').trigger("didClickDestroy");
    });
  },

  didInsertElement: function(){
    this.$().css("margin-bottom", -38);
    this.$().animate({
      'top': '+=38px',
      'margin-bottom': '+=42px'
    }, 500);
  }
});

export default HbFlashComponent;
