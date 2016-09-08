import Ember from 'ember';

export function avatarZindex(index){
  var style = `z-index: ${100 - index}`;
  return Ember.String.htmlSafe(style);
}

export default Ember.Helper.helper(avatarZindex);
