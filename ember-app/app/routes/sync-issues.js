import Ember from 'ember';

var SyncIssuesRoute = Ember.Route.extend({
  boardSyncing: Ember.inject.service(),

  model: function(){
    var repo = this.modelFor("application");
    return repo;
  },

  afterModel: function (model){
    var since = new Date(new Date().getTime() - 3600000);
    this.get('boardSyncing').syncIssues(model.get('board'), {since: since.toISOString()});
    this.transitionTo('application');
  }
});

export default SyncIssuesRoute;
