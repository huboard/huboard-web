import IssueReferences from 'app/utilities/parsing/rules/issue-references';
import html from '../../../../fixtures/issue-html-body';
import Ember from 'ember';

import {
  module,
  test
} from 'qunit';

var sut;

module('Rules/IssueReferences', {
  setup: function(){
    sut = IssueReferences;
  }
});

test('is named correctly', (assert) =>{
  assert.equal(sut.name, 'issue-references');
});

test('discovers issue references', (assert) => {
  var result = sut.condition(html);
  var expected = ['#1', '#2', 'discorick/huboard-test#2'];

  assert.deepEqual(result, expected);
});

test('handles no matches gracefully', (assert) => {
  var html = "<div class='no matchy'></div>"
  var result = sut.condition(html);

  assert.deepEqual(result, []);
});
