import Ember from 'ember';

var HbLabelSelectorComponent = Ember.Component.extend({
  classNames: ["hb-selector-component", "dropdown"],
  classNameBindings: ["customClass"],
  isOpen: function(){
    return false;
  }.property(),
  noLabelsMessage: "None yet",
  editable: true,
  selected: [],
  listItems: function() {
    return this.get("labels")
    .filter(function(item) {
      var term = this.get("filterLabels") || "";
      return item.name.toLowerCase().indexOf(term.toLowerCase()|| item.name.toLowerCase()) !== -1;
    }.bind(this))
    .sort(function(a, b){
      var selectedA = this.get("selected").isAny("name", a.name) ? -1 : 1;
      var selectedB = this.get("selected").isAny("name", b.name) ? -1 : 1;

      if(selectedA < selectedB) { 
        return -1; 
      }
      if(selectedA > selectedB) { 
        return 1; 
      }

      // fall through to alphabetical
      return a.name.localeCompare(b.name);

    }.bind(this));
  }.property("filterLabels","labels"),
  actions: {
    toggleSelector: function(){
      this.notifyPropertyChange('listItems');
      this.set("isOpen", !!!this.$().is(".open"));
      if(this.get("isOpen")) {
        Ember.$(".open").removeClass("open");
        this.$().addClass("open");
        this.$(':input:not(.close):not([type="checkbox"])').first().focus();
        this.set("filterLabels", "");

      } else {
        this.$().trigger("selectorClosed");
        this.$().removeClass("open");
      }
    },
    select : function (label) {
      var selected = this.get("selected");
      var action = "";
      if(selected.isAny("name", label.name)) {
        action = "unlabel";
         selected.removeObject(selected.findBy("name", label.name));
      } else {
        action = "label";
        selected.pushObject(label);
      }
      this.sendAction("labelsChanged", label, action);
    }
  },
  didInsertElement: function(){
    var _self = this;
    Ember.$("body").on("click.outside", ()=>{
      if(_self.isDestroying){ return; }
      if(_self.$().is(".open")){
        _self.send("toggleSelector");
      }
    });
  },
  willDestroyElement: function(){
    Ember.$("body").off("click.outside");
  }
});

export default HbLabelSelectorComponent;
