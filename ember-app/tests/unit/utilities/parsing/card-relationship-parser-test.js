import CardRelationshipParser from 'huboard-app/utilities/parsing/card-relationship-parser';

import {
  module,
  test
} from 'qunit';

var sut;
module('CardRelationshipParser', {
  setup: function(){
    sut = CardRelationshipParser;

    sut.context.rules = [
      { name: 'issue-references', condition: sinon.stub().returns([]) }
    ];
  }
});

test('Parses issue references', (assert) =>{
  var input = 'Some Fancy String...';
  var issue_references_rule =  sut.context.rules.find((rule)=> {
    return rule.name === 'issue-references';
  });

  sut.parse(input);
  assert.ok(issue_references_rule.condition.calledOnce);
});
