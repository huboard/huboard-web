import Ember from 'ember';

export function repoColorStyle(hex) {
  const color = "7965cc";
  var style = `color: #${hex ? hex : color}`;
  return Ember.String.htmlSafe(style);
}

export default Ember.Helper.helper(repoColorStyle);

