
(function($) {

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
