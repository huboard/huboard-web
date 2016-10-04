import Ember from 'ember';
import BufferedMixin from 'huboard-app/mixins/buffered';

var MilestonesEditController = Ember.Controller.extend(BufferedMixin, {
  isCollaboratorBinding: "model.repo.isCollaborator",
  errors: false,
  clearErrors: function(){
    this.set("errors", false);
  }.observes('bufferedContent.title', 'bufferedContent.description', 'bufferedContent.due_on'),
  dueDate: Ember.computed.alias('bufferedContent.due_on'),
  actions: {
    submit: function() {
      var controller = this;
      var column = this.get("column");
      this.set("processing",true);

      this.get("bufferedContent").applyBufferedChanges();
      this.get("model").update(column)
        .then(function(){
           controller.send("closeModal");
           controller.set("processing",false);
        }).fail(function(){
           controller.set("processing",false);
           controller.set("errors", true);
        });
    },
    clearDueDate: function(){
      this.set("bufferedContent.due_on", null);
    }
  },
  disabled: function () {
      return this.get("processing") || !this.get("isValid");
  }.property("processing","isValid"),
  isValid: function () {
    return this.get("bufferedContent.title");
  }.property("bufferedContent.title")
});

export default MilestonesEditController;
