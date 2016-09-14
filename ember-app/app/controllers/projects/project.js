import Ember from 'ember';
var ProjectController = Ember.Controller.extend({
  application: Ember.inject.controller(),
  registeredColumns: Ember.A(),
  actions: {
    registerColumn: function(column_component){
      this.get("registeredColumns").pushObject(column_component);
    },
    unregisterColumn: function(column_component){
      this.get("registeredColumns").removeObject(column_component);
    },
  }
});

export default ProjectController;
