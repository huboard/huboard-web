import Ember from 'ember';

var HbMultiAssigneeComponent = Ember.Component.extend({
  classNames: ["hb-selector-component", "dropdown"],
  currentUser: function () {
    return App.get("currentUser");
  }.property("App.currentUser"),
  isOpen: function(){
    return false;
  }.property(),


  listItems: function () {
    return this.get("assignees")
    .filter(function(item) {
      var term = this.get("filterPeople") || "";
      return item.login.toLowerCase().indexOf(term.toLowerCase()|| item.login.toLowerCase()) !== -1;
    }.bind(this))
    .sort(function(a, b){
      // always put current user on top
      if(a.login === this.get('currentUser.login')) {
        return -1;
      }
      if(b.login === this.get('currentUser.login')) {
        return 1;
      }

      // selected items next
      var selectedA = this.get("selected").isAny("login", a.login) ? -1 : 1;
      var selectedB = this.get("selected").isAny("login", b.login) ? -1 : 1;

      if(selectedA < selectedB) { 
        return -1; 
      }
      if(selectedA > selectedB) { 
        return 1; 
      }

      // fall through to alphabetical
      return a.login.localeCompare(b.login);

    }.bind(this))
    .map(function(item) {

      return this.ListItem.create({
        selected: this.get("selected").isAny("login", item.login),
        item: item
      });
    }.bind(this));
  }.property("assignees.[]", "filterPeople"),

  ListItem: Ember.Object.extend({
    selected: false,
    item: null
  }),

  actions: {
    toggleSelector: function(){
      this.set("isOpen", !!!this.$().is(".open"));
      this.notifyPropertyChange('listItems');
      if(this.get("isOpen")) {
        this.$().addClass("open");
        this.$(':input:not(.close):not([type="checkbox"])').first().focus();
        this.set("filterPeople", "");

      } else {
        this.$().removeClass("open");
      }
    },
    assignTo: function(listItem) {
      listItem.toggleProperty('selected');
      var action;
      var assignee = listItem.get('item');
      var selected = this.get('selected');
      if(selected.isAny('login', assignee.login)){
        action = 'unassign';
        var obj = selected.findBy('login', assignee.login);
        selected.removeObject(obj);
      } else {
        action = 'assign';
        selected.pushObject(assignee);
      }
      this.sendAction(action, [assignee.login]);
    },
    assignToCurrentUser : function() {
      var currentUser = this.get("currentUser");
      this.get("selected").pushObject(currentUser);
      this.sendAction("assign", [currentUser.login]);
    },
  },
  didInsertElement: function() {
    Ember.$('body').on('keyup.flyout', function(event) {
      if (event.keyCode === 27){ 
        this.trigger("toggleSelector");
      }
    }.bind(this));

    this.$(".hb-flyout").on('click.flyout', function(event){
      if(Ember.$(event.target).is("[data-ember-action],[data-toggle]")){return;}
      if(Ember.$(event.target).parents("[data-ember-action],[data-toggle]").length){return;}
      event.preventDefault();
      event.stopPropagation();  
      this.trigger("toggleSelector");
    }.bind(this));

    this.$(".close").on('click.flyout', function(event){
      if(Ember.$(event.target).is("[data-ember-action],[data-toggle]")){return;}
      if(Ember.$(event.target).parents("[data-ember-action],[data-toggle]").length){return;}
      this.trigger("toggleSelector");
    }.bind(this));
    /* jshint ignore:end */

  },

  willDestroyElement: function() {
    Ember.$('body').off('keyup.flyout');
    this.$(".hb-flyout,.close").off("click.modal");
  }

});

export default HbMultiAssigneeComponent;
