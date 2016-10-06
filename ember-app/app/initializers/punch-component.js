import Ember from 'ember';

export function initialize(container, application){
  Ember.Component.reopen({
    accept: function(visitor){
      visitor.visit(this);
    }
  });
}

export default {
  name: 'punch-component',
  initialize: initialize
};

