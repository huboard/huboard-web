import Ember from 'ember';
import Model from '../model';

var ProjectColumn = Model.extend({
  issueNumberRegex: /\d+$/,
  isLastColumn: Ember.computed('project.columns.[]', {
    get() {
     return this.get('project.columns.lastObject.data.id') === this.get('data.id'); 
    }
  }),
  sortedIssues: function(){
    var issues = this.get('project.repo.issues');
    return this.get("cards").map((card)=>{
      if(card.content_url){
        var match = card.content_url.match(this.get('issueNumberRegex'));
        if(match){
          var issue = issues.findBy('number', parseInt(match[0]));
          if(issue){
            Ember.set(card, 'issue', issue);
          } else {
            Ember.set(card, 'note', `Issue #${match[0]} has been archived`);
          }
        }
      }
      return card;
    }).filter((card) => {
      return Ember.get(card, 'note') || !Ember.get(card, 'issue.isArchived');
    });
  }.property("data.cards.[]", 'project.repo.issues.[]'),
});

export default ProjectColumn;
