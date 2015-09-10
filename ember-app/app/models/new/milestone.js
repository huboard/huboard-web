import Ember from 'ember';
import Model from '../model';

var Milestone = Model.extend({
  blacklist: ["board", "repo"]
});

export default Milestone;

