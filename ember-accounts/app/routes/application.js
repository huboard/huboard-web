import Ember from 'ember';
import User from '../models/user';
import Organization from '../models/organization';

export default Ember.Route.extend({
  model() {
    return Ember.$.getJSON("/api/profiles").then((response) => {
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
  }
});
