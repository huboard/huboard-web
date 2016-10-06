import request from 'ic-ajax';
import { defineFixture as fixture } from 'ic-ajax';

import IssueController from "huboard-app/controllers/issue";
IssueController.reopen({
  socket: sinon.spy()
});

import {  
  moduleFor,
  test
} from "ember-qunit";

moduleFor("controller:issue/reference", "IssueReferenceController",{
});

test("fetchCommit", function(assert){
  var commit = {
    sha: 'abc1234'
  };

  fixture("/api/discorick/projects/commit/abc1234", {
    response: commit,
    jqXHR: {},
    textStatus: 'success'
  });


  this.subject().fetchCommit({
    commit_url: 'https://api.github.com/repos/discorick/projects/commit/abc1234',
    commit_id: "abc1234"
  }).then(response => {
    assert.equal(response.sha, 'abc1234');
  });
});
