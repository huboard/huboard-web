import Ember from 'ember';

export default function animateModalOpen() {
  
  var promise = new Ember.RSVP.defer();

  Ember.$('body').addClass("fullscreen-open");
  promise.resolve();
  

  return promise.promise;
}
