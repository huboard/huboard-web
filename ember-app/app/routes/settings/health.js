import Ember from 'ember';

var SettingsHealthRoute = Ember.Route.extend({
  model: function(){
    var repo = this.modelFor("application");
    return repo;
  }
});

export default SettingsHealthRoute;
