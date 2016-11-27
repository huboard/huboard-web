import Board from 'app/models/new/board';
import Ember from 'ember';
import CreateIssue from 'app/models/forms/create-issue';
import animateModalClose from 'app/config/animate-modal-close';

var ProjectsRoute = Ember.Route.extend({
  qps: Ember.inject.service("query-params"),

  model: function(){
    var repo = this.modelFor("application");
    return Board.fetch(repo).then(function(board){
      return board.fetchProjects(repo);
    });
  },
  afterModel: function (model){
    if (model.get("isLoaded")) {
      return;
    }
  },
  renderTemplate: function() {
    this._super.apply(this, arguments);

    var assignee = this.controllerFor("assignee");
    assignee.set("model", this.currentModel);
    this.render('assignee', {
      into: 'projects', 
      outlet: 'sidebarTop',
      controller: assignee
    });

    this.render('filters', {into: 'projects', outlet: 'sidebarMiddle'});
  },
  setupController: function(controller, model){
   this._super(controller, model);
   this.get("qps").applyFilterBuffer();
   this.get("qps").applySearchBuffer();
  },

  actions : {
  }
});

export default ProjectsRoute;

