window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: "silence", matchMessage: "Ember.LinkView is deprecated. Please use Ember.LinkComponent." },
    { handler: "silence", matchMessage: "Ember.keys is deprecated in favor of Object.keys" },
    { handler: "throw", matchId: "ember-htmlbars.make-bound-helper" },
    { handler: "throw", matchId: "ember-htmlbars.register-helper" },
    { handler: "throw", matchId: "ember-views.view-deprecated" },
    { handler: "throw", matchMessage: "Controller#needs is deprecated, please use Ember.inject.controller() instead" },
    { handler: "silence", matchMessage: "Using the same function as getter and setter is deprecated." },
    { handler: "silence", matchId: "ember-metal.@each-dependent-key-leaf" },
    { handler: "silence", matchMessage: "Ember.create is deprecated in favor of Object.create" },
    { handler: "silence", matchId: "ember-views.dispatching-modify-property" }
  ]
};
