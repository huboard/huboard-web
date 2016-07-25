import Ember from 'ember';
import ajax from 'ic-ajax';

var IssueReferenceController = Ember.Controller.extend({
  fetchCommit: function(commit){
    var _self = this;
    var repo = this.getRepoName(commit.commit_url);
    return ajax("/api/" + repo + "/commit/" + commit.commit_id, {global: false})
      .then(function(response){
        if(response.message === "Not Found"){
          return {
            sha: commit.commit_id,
            html_url: _self.toHtmlUrl(commit.commit_url),
            commit: {
              message: "(currently unable to fetch this commit message)"
            }
          };
        }
        return response;
      });
  },
  getRepoName: function(url){
    const parts = url.split("/").reverse();
    return parts.slice(2, 4).reverse().join("/");
  },
  //It's silly, but need this to call the html versus the api endpoint
  toHtmlUrl: function(url){
    if(!url){ return ""; }
    return url.replace("api.", "")
      .replace("repos/", "")
      .replace("commits", "commit");
  }
});

export default IssueReferenceController;
