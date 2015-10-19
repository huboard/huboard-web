import Ember from 'ember';

export default Ember.Helper.extend({
  compute: function(args){
    var object = args[0];
    var key = args[1];
    return object[key];
  }
});

