import Ember from 'ember';

var ProjectRoute = Ember.Route.extend({
  model: function(params) {
    var repo = this.modelFor("application");
    var project = repo.get('projects').findBy('number', parseInt(params.project_id));
    return repo.fetchProject(project.number); 
  }, 
  actions: {
    openFullscreenIssue: function(model) {
      this.transitionTo("projects.project.issue", this.currentModel,  model);
    },
  }
});

export default ProjectRoute;
