import IssueReferences from 'huboard-app/utilities/parsing/rules/issue-references';
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
  var expected = [
    {
      url: 'https://github.com/discorick/skipping.stones/issues/1',
      id: 115312754,
      text: '#1'
    },
    {
      url: 'https://github.com/discorick/skipping.stones/issues/2',
      id: 115312772,
      text: '#2'
    },
    {
      url: 'https://github.com/discorick/huboard-test/issues/2',
      id: 63784173,
      text: 'discorick/huboard-test#2'
    }
  ];

  assert.deepEqual(result, expected);
});

test('handles no matches gracefully', (assert) => {
  var html = "<div class='no matchy'></div>";
  var result = sut.condition(html);

  assert.deepEqual(result, []);
});
