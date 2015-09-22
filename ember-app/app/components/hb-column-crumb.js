import Ember from 'ember';

var HbColumnCrumbComponent = Ember.Component.extend({
  tagName: "li",
  classNames: ['crumb'],
  classNameBindings: ["stateClass", "isSelected:active:inactive", "indexClass"],
  isSelected: function(){
    return this.get("issue.data.current_state.name") === this.get("column.data.name");
  }.property("issue.data.current_state"),
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
    this.$("a").click((ev)=> {
      ev.preventDefault();
    });
  }.on("didInsertElement"),
  actions: {
    onSelect: function(column){
      if(!this.parentView.get("isEnabled")){ return false;}
      var order = this.get("issue.data._data.order");
      this.get("issue").reorder(order, column);
    }
  }
});

export default HbColumnCrumbComponent;
