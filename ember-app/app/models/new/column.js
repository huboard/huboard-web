import Ember from 'ember';


var Column = Ember.Object.extend(Ember.PromiseProxyMixin, {
  isFirst: false,
  isLast: false,
  filteredContent: Ember.computed.filter('content.@each.columnIndex', function(item){
    return item.get('columnIndex') === this.get('data.index');
  }),
  columns: Ember.computed.alias("board.columns"),
  isLastColumn: function(){
    return this.get("columns.lastObject.data.name") === this.get("data.name");
  }.property("columns.lastObject"),
  isFirstColumn: function(){
    return this.get("columns.firstObject.data.name") === this.get("data.name");
  }.property("columns.firstObject"),
  sortedIssues: function(){
    var issues = this.get("board.issues")
      .filter(this.filterStrategy.bind(this))
      .sort(this.sortStrategy);
    return issues;
  }.property("board.issues.@each.{columnIndex,order,state}"),
  filterStrategy: function(issue){
    var issue_index = issue.get("columnIndex");
    var same_column = issue_index === this.get("data.index");
    if(this.get("isLastColumn")){
      return !issue.get("isArchived") && (same_column || issue.data.state === "closed");
    }
    return same_column;
  },
  sortStrategy: function(a,b){
    if(a.data._data.order === b.data._data.order){
      if(a.repo.full_name === b.repo.full_name){
        return a.number - b.number;
      }
      return a.repo.full_name - b.repo.full_name;
    }
    return a.data._data.order - b.data._data.order;
  },
});

export default Column;
