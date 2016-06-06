import Ember from 'ember';

export function truncate(params) {
  var string = params[0];
  var length = params[1];
  if(string.length < length){
    return string;
  }
  return `${string.substring(0, length)}...`;
}

export default Ember.Helper.helper(truncate);
