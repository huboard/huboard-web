import Ember from 'ember';

var SettingsLinksIndexController = Ember.Controller.extend({
  needs: ['application', 'settings/links'],
  repoFullName: '',
  shouldDisplayWarning: Ember.computed.alias("controllers.settings/links.shouldDisplayWarning"),
  shouldDisplayError: false,
  errorMessage: '',
  actions: {
    submit: function(){
      var controller = this;
      this.set("isDisabled", true);
      this.get("model.repo").createLink(this.get("repoFullName"), this.get("labels"))
        .then(function(){
          controller.set("isDisabled", false);
          controller.set("shouldDisplayError", false);
          controller.set("errorMessage", '');
          controller.set("repoFullName", "");
          controller.set("labels", "");
        }, function(jqXHR){
          controller.set("shouldDisplayError", true);
          controller.set("isDisabled", false);
          try {
            var response = JSON.parse(jqXHR.responseText);
            controller.set("errorMessage", response.message);
          } catch(err) {
            controller.set("errorMessage", "Could Not Link Board: Unspecified Error");
          }
        });
    }
  }
});

export default SettingsLinksIndexController;
