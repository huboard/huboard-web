import {
  moduleFor,
  test
} from "ember-qunit";

var service;
var groups;
moduleFor("service:filter-groups", {
  needs: [
    "service:filter_groups/board",
    "service:filter_groups/milestone",
    "service:filter_groups/label",
    "service:filter_groups/user",
    "service:filter_groups/member",
    "service:filter_groups/search"
  ],
  setup: function(){
    service = this.subject();
    groups = ["board", "milestone", "label", "user", "member", "search"];
  }
});

test("registers the filter groups", (assert)=> {
  groups.forEach(function(group){
    assert.ok(service.get(group));
  });
});
