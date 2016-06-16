import Ember from 'ember';

var IssueStatusComponent = Ember.Component.extend({
  isVisible: function(){
    return this.get("status.total_count") > 0;
  }.property("status.state"),

  status: {
    statuses: [],
  },
  fetchStatus: function(){
    var repo = this.get("issue.repo.data.repo.full_name");
    var number = this.get("issue.number");
    var url = `/api/${repo}/issues/${number}/status`;
    var _self = this;
    Ember.$.get(url).then(function(response){
      _self.set("status", response);
    });
  }.on("init"),

  statusContexts: function(){
    return this.get("status.statuses").map(function(status){
      return status.context;
    }).uniq();
  }.property("status.statuses.[]"),
  commitStates: function(){
    return this.get("status.statuses").map(function(status){
      return status.state;
    }).uniq();
  }.property("status.statuses.[]"),
  stateCounts: function(){
    var counts = {};
    this.get("status.statuses").forEach(function(status){
      if(counts[status.state]){
        counts[status.state] = counts[status.state] + 1;
      } else {
        counts[status.state] = 1;
      }
    });
    return counts;
  }.property("status.statuses.[]", "status.statuses.@each.state"),
  aggregateState: function(){
    if(this.get('anyPending')){
      return "pending";
    } else {
      return this.get('status.state');
    }
  }.property("anyPending"),
  anyPending: function(){
    return this.get("status.statuses").any((x) => Ember.get(x, 'state') === 'pending');
  }.property("status.statuses.[]", "status.statuses.@each.state"),
  allErrors: function(){
    return this.get('status.statuses').every((x) => {
      const state = Ember.get(x, 'state');
      return state === "failed" || state === "error";
    });
  }.property("status.statuses.[]", "status.statuses.@each.state"),
  allSuccess: function(){
    return this.get('status.state') === "success";
  }.property("status.statuses.[]", "status.statuses.@each.state"),
  iconClass: function(){
    return {
      "success": "ui-icon-checkmark",
      "failure": "ui-icon-x-thin",
      "error": "ui-icon-x-thin",
      "pending": "ui-icon-refresh"
    };
  }.property(),
  stateCopy: function(){
    return {
      "success": "All checks have passed",
      "failure": "Some checks have failed",
      "error": "Some checks have errored",
      "pending": "Some checks are pending"
    };
  }.property()
});

export default IssueStatusComponent;
