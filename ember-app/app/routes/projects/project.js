import Ember from 'ember';

var ProjectRoute = Ember.Route.extend({
  model: function(params) {
    var repo = this.modelFor("application");
    var project = repo.get('projects').findBy('number', parseInt(params.project_id));
    return repo.fetchProject(project.number); 
  }
});

export default ProjectRoute;
