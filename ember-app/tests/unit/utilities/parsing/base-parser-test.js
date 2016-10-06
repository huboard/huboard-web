import BaseParser from 'huboard-app/utilities/parsing/base-parser';
import Ember from 'ember';

import {
  module,
  test
} from 'qunit';

var sut;
var SomeHuboardyParser;

module('BaseParser', {
  setup: function(){
    var parents = { name: 'parents', condition: sinon.stub().returns(['#199']) };
    var children = { name: 'children', condition: sinon.stub().returns(['#256']) };
    var references = { name: 'references', condition: sinon.stub().returns([]) };

    SomeHuboardyParser = Ember.Object.create({
      rules: [parents, children, references]
    });
  }
});

test('Instantiates a contextual Parser', (assert) =>{
  sut = new BaseParser(SomeHuboardyParser);
  assert.equal(sut.context.rules, SomeHuboardyParser.rules);
});

test('Parses input into a tree', (assert) =>{
  var input = 'A String of Things!';
  sut = new BaseParser(SomeHuboardyParser);

  var tree = sut.parse(input);
  
  assert.equal(tree['parents'][0], '#199');
  assert.equal(tree['children'][0], '#256');
  assert.equal(tree['references'], undefined);
});
