import Ember from 'ember';

var IssueReferencesVisitor = Ember.Object.create({
  visit: function(issue){
    var references = issue.get('cardRelationships')['issue-references'] || [];
    var _self = this;
    var promises = references.map((reference)=> {
      return _self.run(_self.discoverIssue, issue, reference);
    });

    Ember.RSVP.all(promises).then((references)=> {
      issue.set('issueReferences', _.compact(references));
    });
  },

  run: function(discovery, issue, reference){
    var _self = this;
    return new Ember.RSVP.Promise((resolve, reject)=>{
      resolve(discovery.call(_self, issue, reference));
      reject();
    });
  },

  discoverIssue: function(issue, reference){
    var issuesById = issue.get('repo.board.issuesById');
    if(issuesById.hasOwnProperty(reference.id)){
      return issuesById[reference.id];
    }
    return this.otherIssue(issue, reference);
  },

  otherIssue: function(issue, reference){
    return this.discoverClosedIssue(issue, reference) ||
      this.discoverMissingIssue(issue, reference);
  },

  discoverClosedIssue: function(issue, reference){
    var match = reference.text.replace(this.repoNamePattern, '');
    var issuesByRepo = issue.get('repo.board.issuesByRepo');
    if(Ember.isBlank(match) || issuesByRepo.hasOwnProperty(match)){ 
      reference.state = 'closed'
      return reference;
    }
  },
  discoverMissingIssue: function(){
    //currently a noop
    return;
  },
  repoNamePattern: /#.+/
});

export default IssueReferencesVisitor;
