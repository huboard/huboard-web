import Ember from 'ember';

var IssueReferencesVisitor = Ember.Object.create({
  visit: function(issue){
    var promises = [
      this.run(this.discoverIssues, issue),
      this.run(this.discoverClosedIssues, issue)
    ];

    Ember.RSVP.all(promises).then((references)=> {
      issue.set('issueReferences', _.flatten(references));
    });
  },

  run: function(discovery, issue){
    var _self = this;
    return new Ember.RSVP.Promise((resolve, reject)=>{
      resolve(discovery.call(_self, issue));
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
  discoverClosedIssues: function(issue){
    var references = issue.get('cardRelationships')['issue-references'] || [];
    var discovered_issues = this.discoverIssues(issue);
    var issuesByRepo = issue.get('repo.board.issuesByRepo');

    var closed = references.filter((reference)=>{
      return !discovered_issues.any((issue)=>{ return issue.get('id') === reference.id });
    }).filter((missing_reference)=>{
      var match = missing_reference.text.replace(this.repoNamePattern, '');
      if(Ember.isBlank(match)){ return true }
      return issuesByRepo.hasOwnProperty(match);
    });
    closed.forEach((ref)=>{ ref.state = 'closed' });

    return closed;
  },
  discoverMissingIssues: function(){
    //Logic for discovering issue references from non-linked repos
  },
  repoNamePattern: /#.+/
});

export default IssueReferencesVisitor;
