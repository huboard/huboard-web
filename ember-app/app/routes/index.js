import Board from 'huboard-app/models/new/board';
import Ember from 'ember';
import CreateIssue from 'huboard-app/models/forms/create-issue';
import animateModalClose from 'huboard-app/config/animate-modal-close';

var IndexRoute = Ember.Route.extend({
  qps: Ember.inject.service("query-params"),

  model: function(){
    var repo = this.modelFor("application");
    return Board.fetch(repo);
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
      into: 'index', 
      outlet: 'sidebarTop',
      controller: assignee
    });

    this.render('filters', {into: 'index', outlet: 'sidebarMiddle'});
  },
  setupController: function(controller, model){
   this._super(controller, model);
   this.get("qps").applyFilterBuffer();
   this.get("qps").applySearchBuffer();
  },

  actions : {
    createFullscreenIssue : function (model, order) {
      this.controllerFor("issue.create").set("model", model || CreateIssue.createNew());
      this.controllerFor("issue.create").set("order", order || {});

      var issue_template = this.modelFor('index').get('repo.issue_template');
      this.controllerFor("issue.create").set("model.body", issue_template);
      
      this.send("openModal","issue.create");
    },
    openFullscreenIssue: function(model){
      this.transitionTo("index.issue", model);
    },
    reopenIssueOrAbort: function(args){
      this.render("issue.reopen", {
        into: "application",
        outlet: "modal",
        controller: "issue.reopen",
        model: args
      });
    },
    openModal: function (view){
      this.render(view, {
        into: "application",
        outlet: "modal"
      });
    },
    closeModal: function() {
      animateModalClose().then(function() {
        this.render('empty', {
          into: 'application',
          outlet: 'modal'
        });
      }.bind(this));
    },
  }
});

export default IndexRoute;
