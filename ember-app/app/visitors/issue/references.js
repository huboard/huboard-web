import Ember from 'ember';

var IssueReferencesVisitor = Ember.Object.create({
  visit: function(issue){
    var promises = [
      this.run(this.discoverIssues, issue)
    ];

    Ember.RSVP.all(promises).then((references)=> {
      issue.set('issueReferences', _.flatten(references));
    });
  },

  run: function(discovery, issue){
    return new Ember.RSVP.Promise((resolve, reject)=>{
      resolve(discovery(issue));
      reject([]);
    });
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
