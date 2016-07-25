import Ember from 'ember';

var MilestonesCreateController = Ember.Controller.extend({
  errors: false,
  clearErrors: function(){
    this.set("errors", false);
  }.observes('model.data.title', 'model.data.description', 'model.data.due_on'),
  dueDate: function(){
    return this.get("model.data.due_on");
  }.property("model.data.due_on"),
  actions: {
    submit: function() {
      var controller = this;
      var milestone = this.get("model.data");
      this.set("processing",true);
      this.get("model.repo").createMilestone(milestone, {})
      .then(() => {
         controller.send("closeModal");
         controller.set("processing",false);
      }).fail(function(){
         controller.set("processing",false);
         controller.set("errors", true);
      });
    },
    clearDueDate: function(){
      this.set("model.data.due_on", null);
    }
  },
  isCollaboratorBinding: "App.repo.is_collaborator",
  disabled: function () {
      return this.get("processing") || !this.get("isValid");
  }.property("processing","isValid"),
  isValid: function () {
    return this.get("model.title");
  }.property("model.title")
});

export default MilestonesCreateController;
