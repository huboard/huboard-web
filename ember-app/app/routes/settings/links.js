import Board from 'huboard-app/models/new/board';
import Ember from 'ember';

var SettingsLinksRoute = Ember.Route.extend({
  model: function(){
    var repo = this.modelFor("application");
    return Board.fetch(repo);
  },
  afterModel: function (model){
    if (model.get("isLoaded")) {
      return;
    }
  }
});

export default SettingsLinksRoute;
