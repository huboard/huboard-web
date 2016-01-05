import Ember from 'ember';

export function stripeDate(value) {
  //const value = Ember.get(this, path);
  const date = new Date(value * 1000);
  return date.toDateString();
}

export default Ember.Helper.helper(stripeDate);
