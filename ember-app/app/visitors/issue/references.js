import Ember from 'ember';

var IssueReferencesVisitor = Ember.Object.create({
  visit: function(issue){
    var references = _.flatten(
      this.discoverIssues(issue)
    )

    issue.set('issueReferences', references);
  },

  discoverIssues: function(issue){
    var references = issue.get('cardRelationships')['issue-references'] || [];
    var issuesById = issue.get('repo.board.issuesById');
    return references.map((reference)=>{
      if(issuesById.hasOwnProperty(reference.id)){
        return issuesById[reference.id];
      }
    }).compact();
  },
  discoverClosedIssues: function(){
    //Logic for discovering closed issues not already on the board
  },
  discoverMissingIssues: function(){
    //Logic for discovering issue references from non-linked repos
  }
});

export default IssueReferencesVisitor;
