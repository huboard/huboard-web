import { Settings, Session } from 'app/models/settings';

import request from 'ic-ajax';
import { defineFixture as fixture } from 'ic-ajax';
import {
  moduleFor,
  test
} from 'ember-qunit';

var settings;
var session;
Session.reopen({
  storageKey: 'someRepo'
});
session = Session.create({});

Settings.reopen({
  storageKey: 'someRepo'
});
settings = Settings.create({});
moduleFor('model:settings');

[settings, session].forEach(function(sut){ 

  test('it loads the data', function(assert) {
    var name = sut.get('name');
    var mockStore = { getItem: sinon.stub()};
    sut.set('store', mockStore);
    
    sut.loadData();
    
    assert.ok(mockStore.getItem.calledWith(`${name}:someRepo`));
  })

  test('it saves value to a key', function(assert) {
    sut.saveData = sinon.stub();
    var key = 'good';
    var value = {fries: 'day'};
    
    sut.saveKey(key, value);

    assert.equal(sut.get(`data.${key}`), value);
    assert.ok(sut.saveData.called);

  })
});
