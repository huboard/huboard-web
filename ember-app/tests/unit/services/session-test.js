import Ember from 'ember';
import {
  moduleFor,
  test
} from 'ember-qunit';

var sut;
moduleFor('service:session', {
  setup: function(){
    sut = this.subject();
    sut.focusHandlers = ['focusHandler1', 'focusHandler2'];
    sut.get('focusHandlers').forEach((handler) => {
      sut[handler] = sinon.stub();
    });

    sut.blurHandlers = ['blurHandler1', 'blurHandler2'];
    sut.get('blurHandlers').forEach((handler) => {
      sut[handler] = sinon.stub();
    });
  }
});

// Hmm, having trouble dispatching a focus event
//test('Runs Focus Handlers on window.focus', (assert)=>{
//  $(window).trigger('focus');
//
//  assert.ok(sut.focusHandler1.called);
//  assert.ok(sut.focusHandler2.called);
//});

test('Runs Blur Handlers on window.blur', (assert)=>{
  $(window).trigger('blur');

  assert.ok(sut.blurHandler1.called);
  assert.ok(sut.blurHandler2.called);
});


