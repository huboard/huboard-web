import Repo from 'app/models/repo';
import Ember from 'ember'; 

import request from 'ic-ajax';
import { defineFixture as fixture } from 'ic-ajax';
import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('model:repo');

test('it exists', function(assert) {

  var model = this.subject();
  // var store = this.store();
  assert.ok(!!model);
  assert.ok(fixture);
  assert.ok(sinon);
});

test('user url is the owner name', function(assert){
  var model = Repo.create({owner: { login: 'ryan' }});

  assert.equal(model.get('userUrl'), "/ryan");
});

test('fetched board should contain issues', (assert) => {

  var model = Repo.create({full_name: 'huboard/huboard'});

  fixture('/api/huboard/huboard/board', {
    response: { issues:[{}]},
    jqXHR: {},
    textStatus: 'success'
  });
  
  model.fetchBoard([]).then(response => {
    assert.ok(response.issues.length);
  });
});
