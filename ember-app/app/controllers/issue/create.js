import Ember from 'ember';

var IssuesCreateController = Ember.Controller.extend({
  application: Ember.inject.controller(),
  isCollaborator: Ember.computed.alias("selectedRepo.isCollaborator"),
  allRepos: Ember.computed.alias('application.model.repos'),
  selectedRepo: function(){
    return this.get('allRepos.firstObject');
  }.property('allRepos.[]'),
  repoChanged: function(){
    var template = this.get('selectedRepo.issue_template');
    var previous_template = this.get('previousRepo.issue_template');
    if(this.get('issueBodyDirty') && (!template || this.get('templateActive'))){ return; }
    if(previous_template && this.get('model.body') !== previous_template){ return; }

    this.set('templateActive', !Ember.isNone(template));
    this.set('model.body', template);
  }.observes('selectedRepo'),
  otherLabels: Ember.computed.alias("selectedRepo.data.other_labels"),
  assignees: Ember.computed.alias("selectedRepo.data.assignees"),
  //Ugly Hack for backwards Enterprise Compatibiltiy
  assigneesEnabled: function(){
    return this.get("selectedRepo.board.issues").isAny("assignees");
  }.property("selectedRepo.board.issues"),
  milestones: Ember.computed.alias("selectedRepo.data.milestones"),
  columns: "selectedRepo.columns",
  disabled: function () {
    return this.get("processing") || !this.get("isValid");
  }.property("processing","isValid"),
  isValid: function () {
    return this.get("model.title");
  }.property("model.title"),
  issueBodyDirty: function(){
    if(this.get('previousRepo.issue_template')){
      return this.get('model.body') !== this.get('previousRepo.issue_template');
    }
    return !Ember.isEmpty(this.get('model.body'));
  }.property('selectedRepo.data.repo.name', 'model.body'),
  promptForRepoChange: function(){
    return this.get('issueBodyDirty');
  },
  mentions: function(){
    return _.uniq(_.compact(this.get('selectedRepo.assignees')), function(i){
      return i.login;
    });
  }.property('selectedRepo','selectedRepo.assignees'),
  order: {},
  actions: {
    submit: function() {
      if (this.get("processing")){ 
        return; 
      }
      var controller = this;
      this.set("processing",true);
      this.get('selectedRepo').createIssue(this.get('model'), this.get('order')).then(() => {
        controller.set('processing', false);
        controller.get("target").send("closeModal");
      });
    },
    assignRepo: function(repo){
      this.set('previousRepo', this.get('selectedRepo'));
      var get = Ember.get;

      // transfer assignee if possible
      this.set('model.assignee', get(repo, 'assignees').findBy('login', this.get('model.assignee.login')));
      // transfer milestone if possible
      this.set('model.milestone', get(repo, 'milestones').findBy('title', this.get('model.milestone.title')));

      var labels = get(repo, 'other_labels'),
      selectedLabels = this.get('model.labels.length') ?
        this.get('model.labels') : [];
      var commonLabels = labels.filter(function(label){
        let name = get(label, 'name').toLowerCase();// jshint ignore:line
        return selectedLabels.any(function(selected){
          return get(selected,'name').toLowerCase() === name;
        });
      });
      this.set("model.labels", commonLabels);
    }
  }
});

export default IssuesCreateController;
