import Ember from 'ember';

var IssueActivityComponent = Ember.Component.extend({
  classNameBindings: ["eventClass", "model.event:card-event"],
  content: Ember.computed.alias('model'),
  isCollaboratorBinding: "issue.repo.is_collaborator",
  isLoggedInBinding: "App.loggedIn",
  currentUserBinding: "App.currentUser",
  mentions: Ember.computed.alias('issue.mentions'),
  isEditing: false,
  eventClass: Ember.computed('model.event', function(){
    return "card-event-" + this.get('model.event');
  })
});

export default IssueActivityComponent;
