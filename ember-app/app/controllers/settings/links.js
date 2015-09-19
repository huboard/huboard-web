import Ember from 'ember';

var SettingsLinksController = Ember.Controller.extend({
  repository: Ember.computed.alias("model.repo.data.repo"),
  columns: Ember.computed.alias("model.columns"),
  shouldDisplayWarning: function(){
    return this.get("model.repo.links.length") > 5;
  }.property('model.repo.links.length')
});

export default SettingsLinksController;
