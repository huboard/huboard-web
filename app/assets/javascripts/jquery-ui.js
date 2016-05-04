
(function($) {

  $.widget('huboard.superSortable', $.ui.sortable, {
    _mouseDrag: function(event, noPropagation){
      this._superApply(arguments);

      var i, item, itemElement, intersection,
      o = this.options,
      scrolled = false;

      var position = this._generatePosition( event, true );

      
    if(true || this.scrollParent[0] !== document && this.scrollParent[0].tagName !== "HTML") {
      var scrollContailer = $('.board')[0];

      var things = {
        position: position,
        lastPositionAbs: this.lastPositionAbs,
        overflowOffset: this.overflowOffset,
        boundingClientRect: scrollContailer.getBoundingClientRect(),
        helperRect: this.helper[ 0 ].getBoundingClientRect()
      }

      console.log(things.position, things.boundingClientRect, things.helperRect);
      //console.log(this.direction, (things.boundingClientRect.right - things.helperRect.right) - scrollContailer.scrollLeft)

      var isOverright = ((things.boundingClientRect.right - things.helperRect.right) - scrollContailer.scrollLeft) < 0

      if(isOverright){
        scrollContailer.scrollLeft += 20;
        this.helper[0].style.left += 20;
      } else if (things.helperRect.left < 20 && scrollContailer.scrollLeft > 0) {
        scrollContailer.scrollLeft -= 20;
      }

    } 

      return false;
    }
  });
  return;

  var _mouseDrag = $.ui.sortable.prototype._mouseDrag;
  $.ui.sortable.prototype._mouseDrag = function(event) {
    var i, item, itemElement, intersection,
    o = this.options,
    scrolled = false;

    //this._contactContainers(event);

    //Do scrolling
    if(this.scrollParent[0] !== document && this.scrollParent[0].tagName !== "HTML") {
      this.overflowOffset = this.currentContainer.element.offset();
      var scrollContailer = this.currentContainer.element[0];
      if((this.overflowOffset.top + scrollContailer.offsetHeight) - event.pageY < o.scrollSensitivity) {
        scrollContailer.scrollTop = scrolled = scrollContailer.scrollTop + o.scrollSpeed;
      } else if(event.pageY - this.overflowOffset.top < o.scrollSensitivity) {
        scrollContailer.scrollTop = scrolled = scrollContailer.scrollTop - o.scrollSpeed;
      }
      if((this.overflowOffset.left + scrollContailer.offsetWidth) - event.pageX < o.scrollSensitivity) {
        scrollContailer.scrollLeft = scrolled = scrollContailer.scrollLeft + o.scrollSpeed;
      } else if(event.pageX - this.overflowOffset.left < o.scrollSensitivity) {
        scrollContailer.scrollLeft = scrolled = scrollContailer.scrollLeft - o.scrollSpeed;
      }

    } else {

      if(event.pageY - $(document).scrollTop() < o.scrollSensitivity) {
        scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
      } else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity) {
        scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
      }
    }


    if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour) {
      $.ui.ddmanager.prepareOffsets(this, event);
    }
    return _mouseDrag.apply(this, arguments);
  };


})(jQuery);
