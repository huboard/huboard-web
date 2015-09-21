import Ember from 'ember';
import ajax from 'ic-ajax';

var SettingsHealthController = Ember.Controller.extend({
  isProcessing: false,
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
      }).then((checks) => {
        debugger;
        this.set('isProcessing', false);
      });
    }
  }
});

export default SettingsHealthController;

