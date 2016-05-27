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
    sut = IssueReferencesVisitor;

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

test('discovers referenced issues in the model', (assert) =>{
  var result = sut.discoverIssues(issue);
  assert.equal(result[0].name, 'issue1', 'Discovers the references');
  assert.equal(result[1].name, 'issue2', 'Discovers the references');
});

