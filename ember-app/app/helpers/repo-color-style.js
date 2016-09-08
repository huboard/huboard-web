import Ember from 'ember';

export function repoColorStyle(hex) {
  const color = (Ember.isArray(hex) ? hex[0] : hex) || "7965cc";
  var style = `color: #${color}`;
  return Ember.String.htmlSafe(style);
}

export default Ember.Helper.helper(repoColorStyle);

