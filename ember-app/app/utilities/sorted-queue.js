import Ember from "ember";

var sortedQueue = function(callback, opts){
  let queue = [];
  var setTime = opts.time ? opts.time : 100;
  var sort = opts.sort ? opts.sort : null;

  Ember.run.debounce(this, function(){
    sortQueue(queue, sort).forEach(function(item){
      callback(item);
    });
    queue.clear();
  }, setTime);
  return function(item){ queue.addObject(item); };
};

function sortQueue(array, sortBy){
  return array.sort(sortBy);
};

export default sortedQueue;
