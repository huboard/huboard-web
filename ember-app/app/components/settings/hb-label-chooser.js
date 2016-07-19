import Ember from 'ember';

var HbLabelChooserComponent = Ember.Component.extend({
  classNames: ["hb-label-chooser"],
  isVisible: Ember.computed.gt("labels.length", 0),
  applyColor: function(){
    if(this.get("labels.length")){
      Ember.$("div.hb-label-container").each(function(i,el){
        var color = Ember.$(el).data("color");
        Ember.$(el).css("background", `#${color}`);
        Ember.$(el).css("border-color", `#${color}`);
      });
    }
  }.on("didUpdate"),
  actions: {
    toggleLabel: function(label, selected){
      if(selected){
        this.get("selected").addObject(label.name);
      } else {
        this.get("selected").removeObject(label.name);
      }
    }
  }
});

export default HbLabelChooserComponent;
