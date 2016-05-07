import Ember from 'ember';
import ajax from 'ic-ajax';

var SettingsIntegrationsController = Ember.Controller.extend({
  needs: ['application'],
  possibleIntegrations: [
    Ember.Object.extend({
      name: "Webhook",
      attrs: {
        webhookURL: ""
      },
      disabled: function(){
        return !this.get("attrs.webhookURL");
      }.property("attrs.webhookURL"),
      clearForm: function(){
        this.set("attrs.webhookURL", "");
      }
    }).create(),
    Ember.Object.extend({
      name: "Gitter",
      attrs: {
        webhookURL: ""
      },
      disabled: function(){
        return !this.get("attrs.webhookURL");
      }.property("attrs.webhookURL"),
      clearForm: function(){
        this.set("attrs.webhookURL", "");
      }
    }).create(),

    Ember.Object.extend({
      name: "Slack",
      attrs: {
        webhookURL: "",
        channel: ""
      },
      disabled: function(){
        return !this.get("attrs.webhookURL");
      }.property("attrs.webhookURL"),
      clearForm: function(){
        this.set("attrs.webhookURL", "");
        this.set("attrs.channel", "");
      }
    }).create(),

    Ember.Object.extend({
      name: "HipChat",
      room: "",
      endpoint: "https://api.hipchat.com",
      authToken: "",
      attrs: function(){
        return {
          webhookURL: this.get('webhookURL'),
        };
      }.property('room', 'authToken', 'endpoint'),
      webhookURL: function(){
        return `${this.get('endpoint')}/v2/room/${this.get('room')}/notification?auth_token=${this.get('authToken')}`;
      }.property('room', 'authToken'),
      disabled: function(){
        return !this.get("room") || !this.get("authToken");
      }.property("room", "authToken"),
      clearForm: function(){
        this.set("room", "");
        this.set("authToken", "");
      }
    }).create()

  ],
  disabled: function(){
    return this.get("processing") || this.get("editing.disabled");
  }.property("processing","editing.disabled"),
  actions: {
    transitionTo: function(integration) {
      Ember.Route.prototype.render
        .call({
            router:this.container.lookup("router:main"), 
            container: this.container
          }, 
          "integrations." + integration.name.toLowerCase(), {
            into:"integrations.integrations",
            controller: this
          }
        );

      this.set("editing", integration);
    },
    cancel: function() {
      this.send("transitionTo", {name: "index"});
    },
    removeWebhook: function(hook){
      this.get("model.integrations").removeObject(hook);
      var endpoint = "/api/" + this.get("controllers.application.model.data.repo.full_name") + "/integrations";
      ajax({
        url: endpoint + "/" + hook.get("_id"),
        type: "DELETE",
        data: {
          rev: hook.get("_rev")
        }
      });
    }
  }
});

export default SettingsIntegrationsController;
