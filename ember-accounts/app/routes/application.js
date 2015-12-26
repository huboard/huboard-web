import Ember from 'ember';
import User from '../models/user';
import Organization from '../models/organization';

export default Ember.Route.extend({
  model() {
    return Ember.$.getJSON("/api/profiles").then((response) => {
      console.log(response);
      let user = User.create(response.user);

      let orgs = Ember.A();

      // We couldn't use a call to map() here, could we?
      response.orgs.forEach(org => {
        orgs.pushObject(Organization.create(org));
      });

      return Ember.Object.create({
        user: user,
        orgs: orgs
      });
    });
  },
  actions: {
    openModal(view) {
      this.render(view, {
        into: "application",
        outlet: "modal"
      });
    },
    closeModal(view) {
      this.render(view);
    },
    animateModalClose() {
      let promise = new Ember.RSVP.defer();

      Ember.$('body').removeClass("fullscreen-open");
      promise.resolve();

      return promise.promise;
    },
    animateModalOpen() {
      let promise = new Ember.RSVP.defer();

      Ember.$('body').addClass("fullscreen-open");
      promise.resolve();

      return promise.promise;
    },

  }
});
