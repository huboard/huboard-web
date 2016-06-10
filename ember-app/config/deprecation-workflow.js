window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: "silence", matchMessage: "Ember.LinkView is deprecated. Please use Ember.LinkComponent." },
    { handler: "silence", matchMessage: "Ember.keys is deprecated in favor of Object.keys" },
    { handler: "throw", matchId: "ember-htmlbars.make-bound-helper" },
    { handler: "throw", matchId: "ember-htmlbars.register-helper" },
    { handler: "throw", matchId: "ember-views.view-deprecated" },
    { handler: "throw", matchMessage: "Controller#needs is deprecated, please use Ember.inject.controller() instead" },
    { handler: "throw", matchMessage: "Using the same function as getter and setter is deprecated." },
    { handler: "throw", matchId: "ember-metal.@each-dependent-key-leaf" },
    { handler: "throw", matchMessage: "Ember.create is deprecated in favor of Object.create" },
    { handler: "throw", matchId: "ember-views.dispatching-modify-property" }
  ]
};
