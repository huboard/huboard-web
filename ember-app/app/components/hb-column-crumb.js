import Ember from 'ember';

var HbColumnCrumbComponent = Ember.Component.extend({
  tagName: "li",
  classNames: ['crumb'],
  classNameBindings: ["stateClass", "isSelected:active:inactive", "indexClass"],
  isSelected: function(){
    var current_issue = this.get("issue");
    if(!current_issue){ return false; }
    return this.get("column.sortedIssues").find((issue)=> {
      return issue.get("id") === current_issue.get("id");
    });
  }.property("column.sortedIssues.[]"),
  indexClass: function(){
    var index = this.get('visibleColumns').indexOf(this.get('column'));

    if(index === 0) {
      return "crumb--first";
    } else if(index === this.get('visibleColumns.length') - 1) {
      return "crumb--last";
    } else {
      return "crumb--middle";
    }

  }.property('visibleColumns', 'issue.data.current_state'),
  disableLink: function(){
    this.$("a").off("click");
    this.$("a").on("click", (ev)=> {
      ev.preventDefault();
    });
  }.on("didInsertElement"),
  teardownEvents: function(){
    this.$("a").off("click");
  }.on("willDestroyElement"),
  actions: {
    onSelect: function(column){
      var parent = this.parentView;
      if(!parent.get("isEnabled") || parent.get("previewOnly")){
        return false;
      }
      var order = this.get("issue.data._data.order");
      this.get("issue").reorder(order, column);
    }
  }
});

export default HbColumnCrumbComponent;
