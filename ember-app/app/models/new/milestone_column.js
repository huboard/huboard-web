import Ember from 'ember';


var Column = Ember.Object.extend(Ember.PromiseProxyMixin, {
  isFirst: false,
  isLast: false,
  filterBy: function(){
    return false;
  }
});

export default Column;
