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
  values: [],
  listItems: function() {
    return this.get("labels")
    .filter(function(item) {
      var term = this.get("filterLabels") || "";
      return item.name.toLowerCase().indexOf(term.toLowerCase()|| item.name.toLowerCase()) !== -1;
    }.bind(this))
    .map(function(item) {
      return this.ListItem.create({
        selected: this.get("selected").any(function (l){return l.name === item.name;}),
        item: item
      });
    }.bind(this));

  }.property("filterLabels","labels", "selected"),

  ListItem: Ember.Object.extend({
    selected: false,
    item: null
  }),

  sortKeys: ["selected:desc", "item.name"],
  selectedSortkeys: ["name"],
  sortedListItems: Ember.computed.sort("listItems", "sortKeys"),
  sortedSelected: Ember.computed.sort("selected", "selectedSortkeys"),

  actions: {
    toggleSelector: function(){
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
      var currentLabel = this.get("listItems").findBy("item.name", label.name);
      var action = "";
      if(selected.isAny("name", label.name)) {
        action = "unlabel";
         selected.removeObject(selected.findBy("name", label.name));
         Ember.set(currentLabel, "selected", false);
      } else {
        action = "label";
        selected.pushObject(label);
        Ember.set(currentLabel, "selected", true);
      }
      this.set("values", selected);
      this.sendAction("labelsChanged", label, action);
    }
  },
  didInsertElement: function(){
    var _self = this;
    Ember.$("body").on("click.outside", ()=>{
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
