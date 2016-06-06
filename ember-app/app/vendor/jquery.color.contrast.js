// Lifted from https://github.com/jquery/jquery-color#extensibility.
(function($){
  $.Color.fn.contrastColor = function() {
    var r = this._rgba[0], g = this._rgba[1], b = this._rgba[2];
    return (((r*299)+(g*587)+(b*144))/1000) >= 131.5 ? "#333" : "white";
  };
})(jQuery);

