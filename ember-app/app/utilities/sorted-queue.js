import Ember from "ember";

var sortedQueue = function(callback, opts){
  const queue = [];
  return function(item){
    queue.addObject(item);
    scheduleRun.call(this, queue, callback, opts);
  };
};

function scheduleRun(queue, callback, opts={}){
  var setTime = opts.time ? opts.time : 100;
  var sort = opts.sort ? opts.sort : null;

  Ember.run.debounce(this, function(){
    sortQueue(queue, sort).forEach(function(item){
      callback.call(this, item);
    }.bind(this));
    queue.clear();
  }, setTime);
};

function sortQueue(array, sortBy){
  return array.sort(sortBy);
};

export default sortedQueue;
