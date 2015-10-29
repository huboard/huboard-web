import Ember from 'ember';
import ajax from 'ic-ajax';

var IssueReferenceController = Ember.Controller.extend({
  needs: ["issue"],

  fetchCommit: function(commit){
    var _self = this;
    var repo = this.get("controllers.issue.model.repo.data.repo.full_name");
    return ajax("/api/" + repo + "/commit/" + commit.commit_id)
      .then(function(response){
        if(response.message === "Not Found"){
          return {
            sha: commit.commit_id,
            html_url: _self.toHtml(commit.commit_url),
            commit: {
              message: "(currently unable to fetch this commit message)"
            }
          }
        }
        return response;
      });
  },
  //It's silly, but need this to call the html versus the api endpoint
  toHtml: function(url){
    if(!url){ return ""; }
    return url.replace("api.", "")
      .replace("repos/", "")
      .replace("commits", "commit");
  }
});

export default IssueReferenceController;
