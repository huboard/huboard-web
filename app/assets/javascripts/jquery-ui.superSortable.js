
(function($) {

  $.widget('huboard.superSortable', $.ui.sortable, {
    options: {
      scroll: false,
      scrollContainer: '.board',
      scrollList: '.column',
      scrollTarget: '.cards'
    },
    _mouseIsOverElement: function mouseIsOverElement(ev, rect){
      return ev.left >= rect.left
      && rect.right > ev.left;
    },
    _findHoveredList: function findHoveredList(ev) {
      const scrollList = this.options.scrollList,
        scrollTarget = this.options.scrollTarget;

      var columns = $(scrollList);
      for(var i = 0; i < columns.length; i++){
        if(this._mouseIsOverElement(ev, columns[i].getBoundingClientRect())){
          return $(columns[i]).find(scrollTarget)[0];
        }
      }
      return null;
    },
    _mouseStart: function(event){
      var superResult = this._superApply(arguments);
      var scrollContainerSelector = this.options.scrollContainer;

      var el = this;
      this._autoscrollPid = setInterval(function(){
        var scrollContainer = $(scrollContainerSelector)[0];

        var boxes = {
          boundingClientRect: scrollContainer.getBoundingClientRect(),
          helperClientRect: el.helper[ 0 ].getBoundingClientRect()
        }

        var pxOverright = (boxes.helperClientRect.right - (boxes.boundingClientRect.right - 100));
        var pxOverleft = ((boxes.boundingClientRect.left + 100) - boxes.helperClientRect.left);

        if(pxOverright > 0 && el.mouseDirection[1] == "right"){
          scrollContainer.scrollLeft += pxOverright * .1;
        } else if (pxOverleft > 0 && el.mouseDirection[1] == "left") {
          scrollContainer.scrollLeft -= pxOverleft * .1;
        }

        var hoveredList = el.lastHoveredList;

        if(hoveredList){
          var hoveredRect = hoveredList.getBoundingClientRect();
          var pxOvertop = ((hoveredRect.top + 50) - boxes.helperClientRect.top);
          var pxOverbottom = (boxes.helperClientRect.bottom - (hoveredRect.bottom - 50));
          if(pxOvertop > 0 && el.mouseDirection[0] == "up") {
            hoveredList.scrollTop -= pxOvertop * .1;
          } else if (pxOverbottom > 0 && el.mouseDirection[0] == "down") {
            hoveredList.scrollTop += pxOverbottom * .1;
          }
        }
      }, 1e3/60);

      return superResult;
    },
    _mouseStop: function(event){
      var superResult = this._superApply(arguments);

      if(this._autoscrollPid){
        clearInterval(this._autoscrollPid);
      }

      return superResult;
    },
    _calculateMouseDelta: function(){
      var lastPosition, currentPosition, originalPosition, currentDelta;

      currentPosition = this.lastPositionAbs;
      originalPosition = this.originalPosition;
      lastPosition = this.cachedPosition || originalPosition;

      this.cachedPosition = currentPosition;

      currentDelta = {
        top: lastPosition.top - currentPosition.top,
        left: lastPosition.left - currentPosition.left
      }

      return currentDelta;

    },
    _calculateMouseDirection: function(delta){
      var previousDirection = this.previousDirection || ["up", "right"];

      var verticalDirection = delta.top == 0 ? previousDirection[0] : delta.top > 0 ? "up" : "down";
      var horizontalDirection = delta.left == 0 ? previousDirection[1] : delta.left > 0 ? "left" : "right";

      return this.previousDirection = [verticalDirection, horizontalDirection];
    },
    _mouseDrag: function(event, noPropagation){
      this._superApply(arguments);

      var mouseDelta = this.mouseDelta = this._calculateMouseDelta();

      this.mouseDirection = this._calculateMouseDirection(mouseDelta);

      this.lastHoveredList = this._findHoveredList(this.lastPositionAbs);

      return false;
    }
  });

})(jQuery);
