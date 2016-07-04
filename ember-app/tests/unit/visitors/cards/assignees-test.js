import cardAssigneesVisitor from 'app/visitors/cards/assignees';
import Ember from 'ember';

import {
  module,
  test
} from 'qunit';

var sut;
var card;
var assignees;

module('Visitors/Cards/Assignees', {
  setup: function(){
    sut = _.clone(cardAssigneesVisitor); // jshint ignore:line

    var issue = Ember.Object.create({data: {}});
    card = Ember.Object.create({issue: issue});

    var width = sinon.stub().returns(300);
    card.$ = sinon.stub().returns({ width: width });

    assignees = [
      { login: 'ricki'},
      { login: 'ryan'},
      { login: 'keith'},
      { login: 'pete'}
    ];

    card.set('filters', Ember.Object.create({ assigneeFilters: [], memberFilters: [] }));
  }
});

test('the card has no assignees', (assert) => {
  card.set('issue.assignees', []);
  sut.visit(card);

  assert.ok(card.get('visibleAssignees').length === 0, 'No assignees are visible');
});

test('assignee filters are active', (assert) => {
  card.get('filters.memberFilters').pushObject({name: 'pete', mode: 1});
  card.get('filters.memberFilters').pushObject({name: 'keith', mode: 2});
  card.set('issue.assignees', assignees);
  sut.visit(card);

  assert.ok(card.get('visibleAssignees').length === 2, 'Only two assignees are visible');
  assert.ok(card.get('visibleAssignees')[0].login === 'keith', 'keith is visible');
  assert.ok(card.get('visibleAssignees')[1].login === 'pete', 'pete is visible');
});
