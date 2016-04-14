import Ember from "ember";

var emojiParser = Ember.Object.create({
  parse: function(string, height){
    if(!window.EMOJIS){ return string; }
    this.height = height ? height : 16;
    return this._process(string);
  },
  _process: function(string){
    var _self = this;
    var matches = _.uniq(string.match(this._pattern));
    matches.forEach((match)=>{
      var key = match.replace(/:/g, "");
      var emoji = window.EMOJIS[key];
      if(emoji){
        var template = _self._template(emoji);
        string = string.replace(_self._buildRegExp(match), template);
      }
    });
    return string;
  },
  _template: function(value){
    return `<img style='height:${this.height}px;' src='${value}'></img>`;
  },
  _pattern: /:(.*?):/g,
  _buildRegExp: function(string){
    var escaped = new RegExp().replace(string);
    return new RegExp(escaped, "g");
  }
});

export default emojiParser;
