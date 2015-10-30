import Ember from "ember";

var emojiParser = Ember.Object.create({
  parse: function(string){
    if(!window.EMOJIS){ return string; }
    return this._process(string);
  },
  _process: function(string){
    var _self = this;
    console.log(string.match(this._match));
    _.each(window.EMOJIS, (value, key)=>{

    });
  },
  _template: function(value){
    return `<img style='height:32px;' src='${value}'></img>`;
  },
  _replace: function(key){
    return `:${key}:`;
  },
  _match: /:([^:]*)/g
});

export default emojiParser;
