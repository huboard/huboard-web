(function(){
  var special_chars = /\+|\-/g;
  RegExp.prototype.replace = function(string){
    return string.replace(special_chars, function(match){
      return '\\'+ match;
    });
  };
})();
