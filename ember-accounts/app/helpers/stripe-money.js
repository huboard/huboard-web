import Ember from 'ember';

export function stripeMoney(value) {
  return `$${parseFloat(value/100).toFixed(0)}`;
}

export default Ember.Helper.helper(stripeMoney);
