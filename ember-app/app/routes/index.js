import CssView from 'app/views/css';
import Board from 'app/models/board';
import NBoard from 'app/models/new/board';
import Ember from 'ember';
import CreateIssue from 'app/models/forms/create-issue';
import Issue from 'app/models/issue';
import animateModalClose from 'app/config/animate-modal-close';

var IndexRoute = Ember.Route.extend({
  qps: Ember.inject.service("query-params"),

  model: function(){
    var repo = this.modelFor("application");
    return NBoard.fetch(repo);
    //var linked_boards = repo.fetchLinkedBoards();
    //return repo.fetchBoard(linked_boards);
  },
  afterModel: function (model){
    if(App.get("isLoaded")) {
      return;
    }
    var cssView = CssView.create({
      content: model
    });
    cssView.appendTo("head");
    App.set("isLoaded", true); 
  },
  renderTemplate: function() {
    this._super.apply(this, arguments);
    this.render('assignee', {into: 'index', outlet: 'sidebarTop'});
    this.render('filters', {into: 'index', outlet: 'sidebarMiddle'});
  },
  setupController: function(controller, model){
   this._super(controller, model);
   this.get("qps").applyFilterBuffer();
   this.get("qps").applySearchBuffer();
  },

  actions : {
    createNewIssue: function(issue){
      var issues = this.modelFor("index").get("issues");
      issues.pushObject(issue);
    },
    createFullscreenIssue : function (model, order) {
      this.controllerFor("issue.create").set("model", model || CreateIssue.createNew());
      this.controllerFor("issue.create").set("order", order || {});
      this.send("openModal","issue.create");
    },
    openFullscreenIssue: function(model){
      this.transitionTo("index.issue", model);
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
