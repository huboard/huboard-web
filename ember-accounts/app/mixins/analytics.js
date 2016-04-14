import Ember from 'ember';

//A temporary solution to get GA shipped, Really what I want here
//is conventionally queued Analytics events - @discorick
export default Ember.Mixin.create({
  actions: {
    purchase(model) {
      window.analytics.page({
        url: `/settings/${this.get('model.login')}/upgrade`,
        path: `/settings/${this.get('model.login')}/upgrade`
      });
      this._super(model);
    }
  }
});
