import Board from 'huboard-app/models/new/board';
import CreateIssue from 'huboard-app/models/forms/create-issue';
import Milestone from 'huboard-app/models/new/milestone';
import Ember from 'ember';
import animateModalClose from 'huboard-app/config/animate-modal-close';

var MilestonesRoute = Ember.Route.extend({
  qps: Ember.inject.service("query-params"),

  model: function() {
    var repo = this.modelFor("application");
    return Board.fetch(repo);
  },

  afterModel: function(model) {
    if (model.get("isLoaded")) {
      return;
    }
  },

  renderTemplate: function() {
    this._super.apply(this, arguments);

    var assignee = this.controllerFor("assignee");
    assignee.set("model", this.currentModel);
    this.render("assignee", {
      into: "milestones",
      outlet: "sidebarTop",
      controller: assignee
    });

    this.render("filters", {
      into: "milestones",
      outlet: "sidebarMiddle"
    });
  },
  setupController: function(controller, model){
   this._super(controller, model);
   this.get("qps").applyFilterBuffer();
   this.get("qps").applySearchBuffer();
  },

  actions: {
    createFullscreenIssue : function (model, order) {
      this.controllerFor("issue.create").set("model", model || CreateIssue.createNew());
      this.controllerFor("issue.create").set("order", order || {});

      var issue_template = this.modelFor('milestones').get('repo.issue_template');
      this.controllerFor("issue.create").set("model.body", issue_template);

      this.send("openModal","issue.create");
    },

    createNewMilestone : function () {
      this.controllerFor("milestones.create").set("model", Milestone.create({data: {}, repo: this.currentModel.repo}));
      this.render("milestones.create", {
        into: "application",
        outlet: "modal"
      });
    },

    editMilestone : function (column) {
      this.controllerFor("milestones");
      this.controllerFor("milestones.edit").set("model", Milestone.create(column.milestone));
      this.controllerFor("milestones.edit").set("column", column);
      this.render("milestones.edit", {
        into: "application",
        outlet: "modal"
      });
    },

    archive: function(issue) {
      issue.archive();
    },

    openFullscreenIssue: function(model) {
      this.transitionTo("milestones.issue", model);
    },

    createMilestoneOrAbort: function(argBag) {
      this.render('milestones.missing', {
        into: 'application',
        outlet: 'modal',
        view: 'milestones.missing',
        model: argBag
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

export default MilestonesRoute;
