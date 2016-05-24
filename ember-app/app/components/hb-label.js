import Ember from 'ember';

var HbLabelComponent = Ember.Component.extend({
  tagName: "div",
  attributeBindings: ["style"],
  classNameBindings: ["selected:active"],
  classNames: ["hb-menu-item"],
  style: function(){
    if(!this.get('selected')){
      return Ember.String.htmlSafe("");
    }
    const color = Ember.$.Color('#' + (this.get('label.color') || "7965cc"));
    var style = `background-color: ${color.alpha(0.3).toString()}; color: ${color.contrastColor()}`;
    return Ember.String.htmlSafe(style);
  }.property('selected'),
  iconStyle: function(){
    const color = Ember.$.Color('#' + (this.get('label.color') || "7965cc"));
    var style = `color: ${color.toString()}`;
    return Ember.String.htmlSafe(style);
  }.property('label.color'),
  squareStyle: function(){
    const color = Ember.$.Color('#' + (this.get('label.color') || "7965cc"));
    var style = `background-color: ${color.toString()}`;
    return Ember.String.htmlSafe(style);
  }.property('label.color'),
  didInsertElement: function () {
     this.$().on("click.label", function () {
       this.get("parentView.controller").send("select", this.get("label"));
     }.bind(this));
  },
  willDestroyElement: function () {
    this.$().off("click.label");
    this._super.apply(this, arguments);
  },
  selected: function () {
    return this.get("parentView.selected").any(function (l){return l.name === this.get("label.name");}.bind(this));
  }.property("parentView.selected.[]")

});

export default HbLabelComponent;
