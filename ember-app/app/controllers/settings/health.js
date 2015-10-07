import Ember from 'ember';

var SettingsHealthController = Ember.Controller.extend({
  repos: Ember.computed('model.repos.[]', {
    get: function(){
      return this.get('model.repos')
        .filter((x) => x.get('isAdmin'));
    }
  })
});

export default SettingsHealthController;
