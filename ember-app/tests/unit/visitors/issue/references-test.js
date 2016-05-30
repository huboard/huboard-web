import IssueReferencesVisitor from 'app/visitors/issue/references';
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

module('Visitors/Issue/References', {
  setup: function(){
    //Clones so any stubs dont pollute other tests
    sut = _.clone(IssueReferencesVisitor);

    //Build an Issue model with everything the visitor needs to succeed
    issuesById = {};
    for(var i=1; i<3; i++){
      issuesById[i] = Ember.Object.create({id: i, name: `issue${i}`});
    }

    issuesByRepo = {
      'parent/repo': {id: 4, name: 'issue4'},
      'huboard/huboard': {id: 5, name: 'issue5'}
    };

    board = Ember.Object.create({ issuesById: issuesById, issuesByRepo: issuesByRepo });
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
  var issue_promise = sinon.stub();
  sut.run = sinon.stub().returns(issue_promise);

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
  assert.ok(Ember.RSVP.all.calledWith([issue_promise, issue_promise]));

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

test('discovers missing closed issues, returns a reference with a status', (assert) => {
  var result = sut.discoverClosedIssues(issue);
  assert.equal(result[0].state, 'closed', 'Infers the existence of a closed issue');
  assert.equal(result[1].state, 'closed', 'Infers the existence of a linked closed issue');
});

