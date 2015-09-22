import Ember from 'ember';
import ajax from 'ic-ajax';

var SettingsHealthController = Ember.Controller.extend({
  isProcessing: false,
  checks: Ember.computed.alias('model.health.content.checks'),
  errorCount: Ember.computed('checks.@each.success', {
    get: function(key) {
      return this.get('checks').filter((x) => !Ember.get(x, 'success')).length;
    }
  }),
  successCount: Ember.computed('checks.@each.success', {
    get: function(key) {
      return this.get('checks').filter((x) => Ember.get(x, 'success')).length;
    }
  }),
  actions: {
    treat(check, repo) {
      const controller = this;
      this.set('isProcessing', true);
      return ajax({
        url: `/api/${this.get('model.data.repo.full_name')}/health/board`,
        dataType: 'json',
        type: 'POST',
        data: {
          name: check.name
        }
      }).then((response) => {

        response.data.forEach((c) => {
          var update = controller.get('checks').findBy('name', c.name);
          if(update) {
            Ember.setProperties(update, c);
          }
        });

        controller.get('model.health.content').saveData();
        this.set('isProcessing', false);
      });
    }
  }
});

export default SettingsHealthController;

