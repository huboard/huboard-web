import CssView from 'app/views/css';
import Board from 'app/models/new/board';
import Ember from 'ember';
import CreateIssue from 'app/models/forms/create-issue';
import animateModalClose from 'app/config/animate-modal-close';

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
    var cssView = CssView.create({
      content: model
    });
    cssView.appendTo("head");
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
      this.send("openModal","issue.create");
    },
    openFullscreenIssue: function(model){
      this.transitionTo("index.issue", model);
    },
    reopenIssueOrAbort: function(args){
      var controller = this.controllerFor("issue.reopen");
      this.render("issue.reopen", {
        into: "application",
        outlet: "modal",
        controller: "issue.reopen",
        model: args
      })
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
