import Ember from 'ember';

var IssueRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    controller.set("model", model);
    controller.unsubscribeFromMessages();
    controller.subscribeToMessages();
  },
  controllerFor: function(name, _skipAssert) {
    return this._super("issue", _skipAssert);
  },
  afterModel: function (model) {
    return model.loadDetails();
  },
  renderTemplate: function () {
    this.set("controller.commentBody", null);
    this.render("issue",{into:'application',outlet:'modal'});
  },
  actions: {
    error: function(error){
      if (App.loggedIn && error.status === 404) {
        var controller = this.controllerFor("application");
        this.render("empty", {
          into:"application",
          outlet:"loading",
          controller: controller, 
        });
        this.send("sessionErrorHandler");
      }
    }
  }
});

export default IssueRoute;
