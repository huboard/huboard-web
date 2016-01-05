import Ember from 'ember';

export function stripeMoney(path) {
  let value = Ember.get(this, path);
  return `$${parseFloat(value/100).toFixed(0)}`;
}

export default Ember.Helper.helper(stripeMoney);
