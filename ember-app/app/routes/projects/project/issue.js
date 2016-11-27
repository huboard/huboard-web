import Route from 'app/routes/issue';


var ProjectIssueRoute = Route.extend({
  model : function (params, transition){
    // hacks!
    var issue = this.modelFor("application")
                  .get("board.issues")
                  .findBy('id', parseInt(params.issue_id));
    if(issue) { return issue; }

    transition.abort();
    this.transitionTo("projects.project", params.project_id);
  },
  actions: {
    closeModal: function () {
      this.transitionTo("projects.project");
      return true;
    }
  }
});

export default ProjectIssueRoute;

