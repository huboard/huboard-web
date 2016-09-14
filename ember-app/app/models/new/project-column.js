import Ember from 'ember';
import Model from '../model';

var ProjectColumn = Model.extend(Ember.PromiseProxyMixin, {
  issueNumberRegex: /\d+$/,
  sortedIssues: function(){
    var issues = this.get('repo.board.repo.issues');
    return this.get("cards").forEach((card)=>{
      if(card.content_url){
        var match = card.content_url.match(this.get('issueNumberRegex'));
        if(match){
          var issue = issues.findBy('number', parseInt(match[0]));
          card.issue = issue;
        }
      }
    });
  }.property("cards.[]"),
});

export default ProjectColumn;
