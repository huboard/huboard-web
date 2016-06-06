import CardRelationshipParser from 'app/utilities/parsing/card-relationship-parser';

import {
  module,
  test
} from 'qunit';

var sut;
module('CardRelationshipParser', {
  setup: function(){
    sut = CardRelationshipParser;

    //Stubs out all the rules conditions
    sut.context.rules.forEach((rule)=>{
      rule.condition = sinon.stub().returns([]);
    });
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
