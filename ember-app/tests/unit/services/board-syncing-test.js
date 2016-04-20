import Ember from 'ember';
import {
  moduleFor,
  test
} from 'ember-qunit';

var sut;
var fakeServer;
var fakeResponse;
moduleFor('service:board-syncing', {
  setup: function(){
    sut = this.subject();
  }
});

test('syncs the boards issues successfuly', (assert)=>{
  var issues = ['issue1', 'issue2'];
  var success = $.ajax().then(()=>{return issues});
  var board = { fetchIssues: sinon.stub().returns(success) };
  sut.syncFlashNotifier = sinon.stub();
  sut.issueSuccess = sinon.stub();

  var done = assert.async();
  sut.syncIssues(board);
  setTimeout(()=>{
    assert.ok(board.fetchIssues.called);
    assert.ok(sut.issueSuccess.calledWith(issues));
    assert.ok(sut.get('syncInProgress') === false);
    done();
  }, 10);
});

test('fails gracefully on syncing the boards issues', (assert)=>{
  var fail = $.ajax('fail');
  var board = { fetchIssues: sinon.stub().returns(fail) };
  sut.syncFlashNotifier = sinon.stub();
  sut.issueFail = sinon.stub();

  var done = assert.async();
  sut.syncIssues(board);
  setTimeout(()=>{
    assert.ok(board.fetchIssues.called);
    assert.ok(sut.issueFail.called);
    assert.ok(sut.get('syncInProgress') === false);
    done();
  }, 10);
});

test('sends a flash notifier on sync', (assert)=> {
  var flash = { add: sinon.stub() };
  sut.set('flashMessages', flash);
  sut.set('syncInProgress', true);

  assert.ok(sut.get('flashMessages').add.calledWith(sut.messageData));
});

test('clears flash when sync is finished', (assert)=> {
  var flash = { queue: [sut.messageData] };
  sut.set('flashMessages', flash);
  sut.set('syncInProgress', false);

  assert.ok(flash.queue[0].progress.status === false);
});
