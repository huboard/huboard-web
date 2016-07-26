import Ember from 'ember';

var HbSelectedColumnComponent = Ember.Component.extend({
  tagName: "ul",
  classNames: ["nav","breadcrumbs"],
  classNameBindings: ["isCustomState:hb-state","stateClass", "isEnabled:enabled:disabled"],
  isCustomState: function(){
    return this.get("stateClass") !== "hb-state-open";
  }.property("stateClass"),
  isEnabled: function() {
    return (this.get("issue.repo.isCollaborator") &&
      this.get("issue.data.state") !== "closed");
  }.property("issue.repo.isCollaborator", "issue.data.state", "previewOnly"),
  stateClass: function(){
    var github_state = this.get("issue.data.state");
    if(github_state === "closed"){
      return "hb-state-" + "closed";
    }

    var custom_state = this.get("issue.customState");
    if(custom_state){
      return "hb-state-" + custom_state;
    }
    return "hb-state-open";
  }.property("issue.data.current_state", "issue.customState", "issue.data.state", "issue.data.other_labels.[]"),
  selectedColumn: function () {
    if(this.get("issue.data.state") === "closed"){
      return this.get("columns.lastObject");
    }
    var state = this.get("issue.data.current_state");
    return this.get("columns").find(function(column){
      return column.data.index === state.index;
    });
  }.property("issue.data.current_state", "issue.customState", "issue.data.state"),
  visibleColumns: function() {
    if(this.get("previewOnly")){ return this.previewColumns(); }
    return this.get('columns');
  }.property("selectedColumn"),
  previewColumns: function(){
    var total = this.get("columns.length"),
      index = this.get("columns").indexOf(this.get("selectedColumn")),
      last = index === (total - 1),
      first = index === 0,
      start = last ? index - 2 : first ? index : index - 1,
      end = last ? index + 2 : first ? index + 3 : (index + 2) > total - 1 ? total : index + 2;

    return this.get("columns").slice(start, end);
  },
  disablePreviewClicks: function(){
    var _self = this;
    if(_self.get("previewOnly")){
      this.$("a").on("click", (ev)=> {
        ev.preventDefault();
        _self.parentView.sendAction("cardClick");
      });
    }
  }.on("didInsertElement"),
  teardownEvents: function(){
    this.$("a").off("click");
  }.on("willDestroyElement"),
});

export default HbSelectedColumnComponent;
