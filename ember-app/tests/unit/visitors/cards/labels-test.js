import CardLabelsVisitor from 'app/visitors/cards/labels';
import Ember from 'ember';

import {
  module,
  test
} from 'qunit';

var sut;
var card;
var labels;

module('Visitors/Cards/Labels', {
  setup: function(){
    sut = _.clone(CardLabelsVisitor); // jshint ignore:line

    var issue = Ember.Object.create({data: {}});
    card = Ember.Object.create({issue: issue});

    var width = sinon.stub().returns(300);
    card.$ = sinon.stub().returns({ width: width });

    labels = [
      { name: 'bug'},
      { name: 'performance'},
      { name: 'never-gonna-happen'},
      { name: 'might-happen'}
    ];

    card.set('filters', Ember.Object.create({ labelFilters: [] }));
  }
});

test('visit and the card has no labels', (assert) => {
  card.set('cardLabels', []);
  sut.visit(card);

  assert.ok(card.get('visibleLabels').length === 0, 'No labels are visible');
});

test('sets visible labels based on display width', (assert) => {
  card.set('cardLabels', labels);
  sut.checkForFilteredLabels = sinon.stub().returns(labels);
  sut.visit(card);

  var result = card.get('visibleLabels');
  assert.ok(result.length === 2, 'Only the first 2 labels are visible');
  assert.ok(result[0].name === 'bug');
  assert.ok(result[1].name === 'performance');
});

test('label filters are active', (assert) => {
  card.set('cardLabels', labels);
    var labelFilters = [
      { name: 'never-gonna-happen', mode: 1},
      { name: 'bug', mode: 2}
    ];
  card.set('filters.labelFilters', labelFilters);
  sut.visit(card);

  var result = card.get('visibleLabels');
  assert.ok(result.length === 2, 'Only 2 labels are visible');
  assert.ok(result[0].name === 'bug', 'bug is visible');
  assert.ok(result[1].name === 'never-gonna-happen', 'never-gonna-heppen is visible');
});
