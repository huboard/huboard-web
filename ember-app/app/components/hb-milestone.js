import Ember from 'ember';

//TODO: Fix milestone selector to use the raw data attributes
// because it causes a mismatch where issue.milestone starts
// as raw json and moves to a milestone model

var HbMilestoneComponent = Ember.Component.extend({
  classNames: ["hb-selector-component", "dropdown"],
  isOpen: function(){
    return false;
  }.property(),
  listItems: function () {
    return this.get("milestones")
    .filter(function(item) {
      var term = this.get("filterMilestones") || "";
      return item.data.title.toLowerCase().indexOf(term.toLowerCase() || item.data.title.toLowerCase()) !== -1;
    }.bind(this))
    .sort(function(a, b) {

      // always put selected on top
      if(a.data.title === this.get('selected.title')) {
        return -1;
      }
      if(b.data.title === this.get('selected.title')) {
        return 1;
      }

      return a.data.title.localeCompare(b.data.title);
    }.bind(this))
    .map(function(item) {
      return this.ListItem.create({
        selector: this,
        item: item.data
      });
    }.bind(this));
  }.property("milestones", "filterMilestones"),
  ListItem: Ember.Object.extend({
    selected: Ember.computed('selector.selected', {
      get() {
        return this.get('item.id') === this.get('selector.selected.id');
      }
    }),
    item: null
  }),
  actions: {
    toggleSelector: function(){
      this.notifyPropertyChange('listItems');
      this.set("isOpen", !!!this.$().is(".open"));
      if(this.get("isOpen")) {
        Ember.$(".open").removeClass("open");
        this.$().addClass("open");
        this.$(':input:not(.close):not([type="checkbox"])').first().focus();
        this.set("filterMilestones", "");

      } else {
        this.$().removeClass("open");
      }
    },
    assignTo: function(listItem) {
      var milestone = listItem.get('item');
      this.sendAction("assign", milestone);
      this.set("selected", milestone);
      this.$().removeClass("open");
      this.set("isOpen", false);
    },
    clearMilestone: function(){
      this.sendAction("assign", "");
      this.set("selected", null);
      this.$().removeClass("open");
      this.set("isOpen", false);
    }
  },
  didInsertElement: function() {
    Ember.$('body').on('keyup.flyout', function(event) {
      if (event.keyCode === 27){ this.set("isOpen", false); }
    }.bind(this));

    this.$(".hb-flyout").on('click.flyout', function(event){
      if(Ember.$(event.target).is("[data-ember-action],[data-toggle]")){return;}
      if(Ember.$(event.target).parents("[data-ember-action],[data-toggle]").length){return;}
      event.preventDefault();
      event.stopPropagation();  
      this.set("isOpen", false);
    }.bind(this));

    this.$(".close").on('click.flyout', function(event){
      if(Ember.$(event.target).is("[data-ember-action],[data-toggle]")){return;}
      if(Ember.$(event.target).parents("[data-ember-action],[data-toggle]").length){return;}
      this.set("isOpen", false);
    }.bind(this));
  },
  willDestroyElement: function() {
    Ember.$('body').off('keyup.flyout');
    this.$(".hb-flyout,.close").off("click.modal");
  }
});

export default HbMilestoneComponent;
