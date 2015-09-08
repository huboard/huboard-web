import Ember from 'ember';

var IssueSelectedColumnView = Ember.CollectionView.extend({
  tagName: "ul",
  classNames: ["nav","breadcrumbs"],
  classNameBindings: ["stateClass", "isEnabled:enabled:disabled"],
  isEnabled: function() {
    return this.get("controller.model.repo.isCollaborator");
  }.property("controller.model.repo.isCollaborator"),
  stateClass: function(){
    var github_state = this.get("controller.model.data.state");
    if(github_state === "closed"){
      return "hb-state-" + "closed";
    }
    var custom_state = this.get("controller.model.customState");
    if(custom_state){
      return "hb-state-" + custom_state;
    }
    return "hb-state-open";
  }.property("controller.model.data.current_state", "controller.model.customState", "controller.model.data.state"),
  itemViewClass: Ember.View.extend({
    tagName: "li",
    templateName: "issue/selected_column",
    classNameBindings: ["isSelected:active", "stateClass"],
    isSelected: function(){
      return this.get("controller.model.data.current_state.name") === this.get("content.data.name");
    }.property("controller.model.data.current_state")
  })

});

export default IssueSelectedColumnView;
