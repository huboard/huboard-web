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
  assert.ok(_.contains(result, '#1'));
  assert.ok(_.contains(result, '#2'));
  assert.ok(_.contains(result, 'discorick/huboard-test#2'));
});

test('handles no matches gracefully', (assert) => {
  var html = "<div class='no matchy'></div>"
  var result = sut.condition(html);

  assert.deepEqual(result, []);
});
