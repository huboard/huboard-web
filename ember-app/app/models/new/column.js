import Ember from 'ember';


var Column = Ember.Object.extend(Ember.PromiseProxyMixin, {
  isFirst: false,
  isLast: false,
  filteredContent: Ember.computed.filter('content.@each.columnIndex', function(item){
    return item.get('columnIndex') === this.get('data.index');
  })
});

export default Column;
