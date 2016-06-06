import Ember from 'ember';

var HbFilterComponent = Ember.Component.extend({
  tagName: "li",
  classNames: ["filter"],
  classNameBindings: ["customColor", "reportTagType"],
  style: function(){
    const color = Ember.$.Color('#' + (this.get('color') || "7965cc"));
    var style = `border-left-color: ${color.toString()};`;

    switch(this.get("modeClass")){
      case "dim":
        style = style + `color: ${color.contrastColor()}; background-color: ${color.alpha(0.6).toString()}`;
        break;
      case "active":
        style = style + `color: ${color.contrastColor()}; background-color: ${color.alpha(1).toString()}`;
        break;
    }

    return Ember.String.htmlSafe(style);
  }.property('color', 'modeClass'),
  reportTagType: function() {
    return this.get('tagType');
  }.property('tagType'),
  customColor: function () {
    return this.get("color") ? "-x" + this.get('color') : "";
  }.property("color"),
  click: function(ev){
    ev.preventDefault();
    var $target = Ember.$(ev.target);
    if($target.is(".ui-icon")){
      this.set("mode", 0);
      return;
    }
    this.set("mode", this.get("modes")[this.get("mode") + 1]);
  },
  modeClass: function(){
    switch(this.get("mode")){
      case 0:
        return "";
      case 1:
        return "dim";
      case 2:
        return "active";
    }
    return "";
  }.property("mode"),
  mode: 0,
  modes:[0,1,2,0],
  name: null,
  lastClicked: null,
});

export default HbFilterComponent;
