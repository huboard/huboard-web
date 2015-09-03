import Ember from 'ember';

var IssueStatusComponent = Ember.Component.extend({
  isVisible: function(){
    return this.get("status.state") != null;
  }.property("status.state"),

  status: {
    statuses: [],
  },
  fetchStatus: function(){
    var repo = this.get("issue.repo.full_name");
    var number = this.get("issue.number");
    var url = `/api/${repo}/issues/${number}/status`
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
        counts[status.state] = counts[status.state]++;
      } else {
        counts[status.state] = 1;
      }
    });
    return counts;
  }.property("status.statuses.[]"),
  stateInflection: function(){
    return this.get("statusContexts").length > 1 ? "statuses" : "state";
  }.property("statusContexts.[]")
});

export default IssueStatusComponent;
