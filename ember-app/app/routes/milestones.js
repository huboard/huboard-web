import CssView from 'app/views/css';
import Board from 'app/models/new/board';
import CreateIssue from 'app/models/forms/create-issue';
import Issue from 'app/models/issue';
import Milestone from 'app/models/new/milestone';
import Ember from 'ember';
import animateModalClose from 'app/config/animate-modal-close';

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
    var cssView = CssView.create({
      content: model
    });
    cssView.appendTo("head");
  },

  renderTemplate: function() {
    this._super.apply(this, arguments);

    this.render("assignee", {
      into: "milestones",
      outlet: "sidebarTop"
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
      this.send("openModal","issue.create");
    },

    createNewMilestone : function () {
      this.controllerFor("milestones.create").set("model", Milestone.create({data: {}, repo: this.currentModel.repo}));
      this.render("milestones.create", {
        into: "application",
        outlet: "modal"
      });
    },

    editMilestone : function (milestone) {
      milestone.originalTitle = milestone.title;
      this.controllerFor("milestones");
      this.controllerFor("milestones.edit").set("model", Milestone.create(milestone));
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

    milestoneUpdated: function(milestone){
      var controller = this.controllerFor("milestones");

      var self = this;
      Ember.run.once(function(){
        var milestones = controller.get("model.milestones");
        var old_milestone = milestones.find(m => {
          return m.title === milestone.originalTitle;
        });
        milestones.removeObject(old_milestone);
        milestones.addObject(milestone);

        //Remap issues to new milestone title (if changed)
        var issues = controller.get("model.combinedIssues");
        issues = issues.forEach(issue => {
          if (issue.milestone && (issue.milestone.title === milestone.originalTitle)){
            issue.set("milestone.title", milestone.title);
            return issue;
          }
          return issue;
        });
        self.send("closeModal");
      });
    }
  }
});

export default MilestonesRoute;
