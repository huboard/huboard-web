import Ember from 'ember';

export function contrastColor(params) {
  let value = params[0];
  return Ember.$.Color('#' + value).contrastColor();
}

export default Ember.Helper.helper(contrastColor);
