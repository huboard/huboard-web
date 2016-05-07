import Ember from 'ember';

export default function animateModalClose() {
  var promise = new Ember.RSVP.defer();

  Ember.$('body').removeClass("fullscreen-open");
  promise.resolve();


  return promise.promise;
}
