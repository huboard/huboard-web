import IssueReferencesVisitor from 'app/visitors/issue/references';
import Ember from 'ember';

import {
  module,
  test
} from 'qunit';

var sut;
var issues;
var board;
var repo;
var issue;

module('Visitors/Issue/References', {
  setup: function(){
    //Clones so any stubs dont pollute other tests
    sut = _.clone(IssueReferencesVisitor);

    //Build an Issue model with everything the visitor needs to succeed
    issues = {};
    for(var i=1; i<3; i++){
      issues[i] = {id: i, name: `issue${i}`};
    };
    board = Ember.Object.create({ issuesById: issues });
    repo = Ember.Object.create({ board: board });
    issue = Ember.Object.create({repo: repo});

    //Mock up discovered issue references on the issue:
    var relationships = {
      'issue-references': [
        {
          url: 'www.anissue.com',
          id: 1,
          text: '#1'
        },
        {
          url: 'www.anotherissue.com',
          id: 2,
          text: '#2'
        }
      ]
    };
    issue.set('cardRelationships', relationships);
  }
});

test('visit', (assert) => {
  var discovered_issues_promise;
  sut.run = sinon.stub().returns(discovered_issues_promise);

  var references = [
    [{issue1: 'issue1'}],
    [{issue2: 'issue2'}],
    []
  ];
  var success = $.ajax().then(()=>{return references});
  Ember.RSVP.all = sinon.stub().returns(success);

  var flat_references = [
    {issue1: 'issue1'},
    {issue2: 'issue2'}
  ];

  sut.visit(issue);
  assert.ok(Ember.RSVP.all.calledWith([discovered_issues_promise]));

  var done = assert.async();
  setTimeout(()=>{
    assert.deepEqual(issue.get('issueReferences'), flat_references);
    done();
  });
});

test('discovers referenced issues in the model', (assert) =>{
  var result = sut.discoverIssues(issue);
  assert.equal(result[0].name, 'issue1', 'Discovers the first reference');
  assert.equal(result[1].name, 'issue2', 'Discovers the references');
});

