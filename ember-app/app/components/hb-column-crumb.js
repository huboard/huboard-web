import Ember from 'ember';

var HbColumnCrumbComponent = Ember.Component.extend({
  tagName: "li",
  classNames: ['crumb'],
  classNameBindings: ["stateClass", "isSelected:active:inactive", "indexClass"],
  isSelected: function(){
    if(this.get("issue.data.state") === "closed"){
      return this.get("visibleColumns.lastObject.data.index") === this.get("column.data.index");
    }
    return this.get("issue.columnIndex") === this.get("column.data.index");
  }.property("issue.columnIndex", "column.data.index"),
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
