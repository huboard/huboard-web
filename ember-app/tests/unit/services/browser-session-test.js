import Ember from 'ember';
import {
  moduleFor,
  test
} from 'ember-qunit';

var sut;
moduleFor('service:browser-session', {
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

test('Runs Blur Handlers on window.blur', (assert)=>{
  $(window).trigger('blur');

  assert.ok(sut.blurHandler1.called);
  assert.ok(sut.blurHandler2.called);
});

test('sets last focus interval', (assert)=>{
  var done = assert.async();
  var interval;
  var interval2;

  sut.trigger('didFocusBrowser');
  interval = sut.get('lastFocus');

  setTimeout(()=>{
    sut.trigger('didFocusBrowser');
    interval2 = sut.get('lastFocus');
    assert.ok(interval < interval2);
    done();
  }, 10);
});

//Focus Handlers
test('Send ember observable didFocusBrowser event', (assert)=>{
  sinon.stub(sut, 'trigger');

  sut.sendFocusEvent();
  assert.ok(sut.trigger.calledWith('didFocusBrowser'));
});

//Blur Handlers
test('Set lastBlur with time of last blur', (assert)=>{
  var done = assert.async();
  var current = sut.get('lastBlur');

  setTimeout(()=>{
    sut.updateLastBlur();
    var updated = sut.get('lastBlur');
    assert.ok((updated - current) >= 100);
    done();
  }, 100);
});
