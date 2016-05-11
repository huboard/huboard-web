
(function($) {

  $.widget('huboard.superSortable', $.ui.sortable, {
    _mouseIsOverElement: function mouseIsOverElement(ev, rect){
      return ev.left >= rect.left
      && rect.right > ev.left;
    },
    _findHoveredList: function findHoveredList(ev) {
      var columns = $('.column');
      for(var i = 0; i < columns.length; i++){
        if(this._mouseIsOverElement(ev, columns[i].getBoundingClientRect())){
          return $(columns[i]).find('.cards')[0];
        }
      }
      return null;
    },
    _mouseStart: function(event){
      var superResult = this._superApply(arguments);

      var el = this;
      this._autoscrollPid = setInterval(function(){
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
    _mouseDrag: function(event, noPropagation){
      this._superApply(arguments);

      var o = this.options;

      var position = this._generatePosition( event, true );

      var scrollContainer = $('.board')[0];

      var boxes = {
        boundingClientRect: scrollContainer.getBoundingClientRect(),
        helperClientRect: this.helper[ 0 ].getBoundingClientRect()
      }

      var isOverright = (boxes.helperClientRect.right - (boxes.boundingClientRect.right - 100)) > 0;
      var isOverleft = ((boxes.boundingClientRect.left + 100) - boxes.helperClientRect.left) > 0;

      if(isOverright){
        scrollContainer.scrollLeft += 20;
        this.helper[0].style.left += 20;
      } else if (isOverleft) {
        scrollContainer.scrollLeft -= 20;
      }

      var hoveredList = this._findHoveredList(position);

      if(hoveredList){
        var hoveredRect = hoveredList.getBoundingClientRect();
        var isOvertop = ((hoveredRect.top + 50) - boxes.helperClientRect.top) > 0;
        var isOverbottom = (boxes.helperClientRect.bottom - (hoveredRect.bottom - 50)) > 0;
        if(isOvertop) {
          hoveredList.scrollTop -= 20;
        } else if (isOverbottom) {
          hoveredList.scrollTop += 20;
        }
      }

      return false;
    }
  });

})(jQuery);
