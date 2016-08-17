import Ember from "ember";

var ScrollingColumnMixin = Ember.Mixin.create(Ember.Evented, {
  //This is the tolerance before triggering the handler
  //currently set to minumum height of a task card
  _tolerance: 80,

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
      var lastIndex = this.get('_lastCardIndex');
      var currentIndex = Math.floor(top / this.get('_tolerance'));
      this._scrollHandler(top, lastScroll, lastIndex, currentIndex);
    });
  }.on('didInsertElement'),
  _scrollHandler: function(top, lastScroll, lastIndex, currentIndex){
    if((top - lastScroll) > 0 && currentIndex > lastIndex){
      this.trigger('columnScrolledDown');
    } else if((top - lastScroll) < 0 && currentIndex < lastIndex){
      this.trigger('columnScrolledUp');
    }
    this.set('_lastCardIndex', currentIndex);
    this.set('_lastScrollPosition', top);
  },
  _unregisterScroll:  function(){
    this.$(this.get('_attachToColumn')).unbind('scroll');
  }.on('willDestroyElement'),
});

export default ScrollingColumnMixin;
