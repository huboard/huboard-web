import Ember from 'ember';
import ajax from 'ic-ajax';

var SettingsHbHealthComponent = Ember.Component.extend({
  isProcessing: false,
  checks: Ember.computed.alias('model.content.checks'),
  errors: Ember.computed('checks.@each.success', {
    get() {
      return this.get('checks').filter((x) => !Ember.get(x, 'success'));
    }
  }),
  errorCount: Ember.computed.alias('errors.length'),
  successCount: Ember.computed('checks.@each.success', {
    get: function() {
      return this.get('checks').filter((x) => Ember.get(x, 'success')).length;
    }
  }),
  actions: {
    treatAll() {
      const controller = this;
      this.set('isProcessing', true);
      return ajax({
        url: `/api/${this.get('repo.data.repo.full_name')}/health/board`,
        dataType: 'json',
        type: 'POST',
        data: {
          names: controller.get('errors').mapBy('name')
        }
      }).then((response) => {

        response.data.forEach((c) => {
          var update = controller.get('checks').findBy('name', c.name);
          if(update) {
            Ember.setProperties(update, c);
          }
        });

        controller.get('model.content').saveData();
        this.set('isProcessing', false);
      });
    },
    treat(check) {
      const controller = this;
      this.set('isProcessing', true);
      return ajax({
        url: `/api/${this.get('repo.data.repo.full_name')}/health/board`,
        dataType: 'json',
        type: 'POST',
        data: {
          names: [check.name]
        }
      }).then((response) => {

        response.data.forEach((c) => {
          var update = controller.get('checks').findBy('name', c.name);
          if(update) {
            Ember.setProperties(update, c);
          }
        });

        controller.get('model.content').saveData();
        this.set('isProcessing', false);
      });
    }
  }
});

export default SettingsHbHealthComponent;


