import Ember from "ember";

var emojiParser = Ember.Object.create({
  parse: function(string){
    if(!window.EMOJIS){ return string; }
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
        var regexp = new RegExp(match, "g");
        string = string.replace(regexp, template); 
      }
    });
    return string;
  },
  _template: function(value){
    return `<img style='height:32px;' src='${value}'></img>`;
  },
  _pattern: /:(.*?):/g
});

export default emojiParser;
