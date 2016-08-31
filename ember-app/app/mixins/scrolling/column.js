import Ember from "ember";

var ScrollingColumnMixin = Ember.Mixin.create(Ember.Evented, {
  //This is the tolerance before triggering the handler
  //currently set to minumum height of a task card
  _toleranceDown: 79,
  _toleranceUp: 85,

  //Scrollable container to attach to
  _attachToColumn: '.cards',

  //Last Position of column relative to its scrollTop
  _lastScrollPosition: 0,

  //Number of cards scrolled count
  _lastCardIndex: 1,
  
  _registerScroll: function(){
    var column = this.$(this.get('_attachToColumn'));
    column.scroll(()=>{
      var top = column.scrollTop();
      var lastScroll = this.get('_lastScrollPosition');
      var currentUp = Math.floor(top / this.get('_toleranceUp'));
      var currentDown = Math.floor(top / this.get('_toleranceDown'));
      this._scrollHandler(top, lastScroll, currentUp, currentDown);
    });
  }.on('didInsertElement'),
  _scrollHandler: function(top, lastScroll, currentUp, currentDown){
    var lastDown = this.get('_lastDown');
    var lastUp = this.get('_lastUp');
    if((top - lastScroll) > 0 && currentDown > lastDown){
      this.trigger('columnScrolledDown');
    } else if((top - lastScroll) < -1 && currentUp < lastUp){
      this.trigger('columnScrolledUp');
    }
    this.set('_lastDown', currentDown);
    this.set('_lastUp', currentUp);
    this.set('_lastScrollPosition', top);
  },
  _unregisterScroll:  function(){
    this.$(this.get('_attachToColumn')).unbind('scroll');
  }.on('willDestroyElement'),
});

export default ScrollingColumnMixin;
