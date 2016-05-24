import Ember from 'ember';

export function selectedLabelStyle(hex) {
  const color = Ember.$.Color('#' + (hex || "7965cc"));
  var style = `background-color: ${color.toString()}; color: ${color.contrastColor()}`;
  return Ember.String.htmlSafe(style);
}

export default Ember.Helper.helper(selectedLabelStyle);
