import Ember from 'ember';
import moment from 'moment';

export default Ember.Helper.helper(function(date){
  date = moment(date).format("L");
  if (date === "Invalid date") {
    return "none";
  }
  return date;
});
