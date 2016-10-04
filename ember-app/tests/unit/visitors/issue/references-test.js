import IssueReferencesVisitor from 'huboard-app/visitors/issue/references';
import Ember from 'ember';

import {
  module,
  test
} from 'qunit';

var sut;
var issuesById;
var issuesByRepo;
var board;
var repo;
var issue;
var relationships;

module('Visitors/Issue/References', {
  setup: function(){
    //Clones so any stubs dont pollute other tests
    sut = _.clone(IssueReferencesVisitor); //jshint ignore:line

    //Build an Issue model with everything the visitor needs to succeed
    issuesById = {};
    for(var i=1; i<3; i++){
      issuesById[i] = Ember.Object.create({id: i, name: `issue${i}`});
    }

    issuesByRepo = {
      'parent/repo': [],
      'huboard/huboard': []
    };

    board = Ember.Object.create({ issuesById: issuesById, issuesByRepo: issuesByRepo });
    repo = Ember.Object.create({ board: board });
    issue = Ember.Object.create({repo: repo});

    //Mock up discovered issue references on the issue:
    relationships = {
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
        },
        {
          url: 'www.aclosedissue.com',
          id: 4,
          text: '#4'
        },
        {
          url: 'www.alinkedclosedissue.com',
          id: 5,
          text: 'huboard/huboard#5'
        }
      ]
    };
    issue.set('cardRelationships', relationships);
  }
});

test('visit', (assert) => {
  var promise = sinon.stub();
  sut.run = sinon.stub().returns(promise);

  var references = [
    {issue1: 'issue1'},
    {issue2: 'issue2'},
    undefined
  ];
  var success = $.ajax().then(()=>{return references;});
  Ember.RSVP.all = sinon.stub().returns(success);

  var flat_references = references.slice(0,2);
  sut.visit(issue);

  var message = 'ensure theres a promise per reference';
  assert.ok(Ember.RSVP.all.calledWith([promise, promise, promise, promise]), message);

  var done = assert.async();
  setTimeout(()=>{
    assert.deepEqual(issue.get('issueReferences'), flat_references, 'returns the issues');
    done();
  }, 500);
});

test('discovers referenced issues in the model', (assert) =>{
  var references = relationships['issue-references'];

  var result = sut.discoverIssue(issue, references[0]);
  assert.equal(result.name, 'issue1', 'Discovers the first reference');

  result = sut.discoverIssue(issue, references[1]);
  assert.equal(result.name, 'issue2', 'Discovers the second reference');
});


test('discovers missing closed issues, returns a reference with a status', (assert) => {
  var references = relationships['issue-references'];

  var result = sut.discoverIssue(issue, references[2]);
  assert.equal(result.state, 'closed', 'Infers the existence of a closed issue');

  result = sut.discoverIssue(issue, references[3]);
  assert.equal(result.state, 'closed', 'Infers the existence of a linked closed issue');
});
