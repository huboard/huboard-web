import Ember from 'ember';
import Model from '../model';
import correlationId from 'huboard-app/utilities/correlation-id';
import CardSubscriptions from "huboard-app/mixins/subscriptions/card";
import Messaging from "huboard-app/mixins/messaging";
import IssueFiltersMixin from "huboard-app/mixins/issue-filters";

import CardRelationshipParser from 'huboard-app/utilities/parsing/card-relationship-parser';
import issueReferenceVisitor from 'huboard-app/visitors/issue/references';

var Issue = Model.extend(IssueFiltersMixin, Messaging, CardSubscriptions, {
  blacklist: ["repo"],
  columnIndex: Ember.computed.alias("data.current_state.index"),
  order: Ember.computed.alias("data._data.order"),
  milestoneOrder: Ember.computed.alias("data._data.milestone_order"),
  milestoneTitle: Ember.computed.alias("milestone.title"),
  commentCount: Ember.computed.alias("data.comments"),
  isArchived: function(){
    return this.get("customState") === "archived";
  }.property("customState"),
  correlationId: correlationId,
  assignee: Ember.computed.alias("data.assignee"),
  linkedColor: Ember.computed.alias("repo.data.repo.color.color"),
  repoName: function(){
    var parent_owner = this.get('repo.parent.repo.owner.login');
    var current_owner = this.get('data.repo.owner.login');
    if(!parent_owner || parent_owner === current_owner){
      return this.get('data.repo.name');
    }
    return this.get('data.repo.full_name');
  }.property('data.repo.full_name'),
  apiUrl: function(){
    var full_name = this.get("repo.data.repo.full_name");
    return `/api/${full_name}/issues/${this.get("data.number")}`;
  }.property("data.number", "repo.data.repo.full_name"),
  isReady: Ember.computed.equal('stateClass', 'hb-state-ready'),
  isBlocked: Ember.computed.equal('stateClass', 'hb-state-blocked'),
  isClosed: Ember.computed.equal('stateClass', 'hb-state-closed'),
  stateClass: function(){
     var github_state = this.get("data.state");
     if(github_state === "closed"){
       return "hb-state-" + "closed";
     }
     var custom_state = this.get("customState");
     if(custom_state){
       return "hb-state-" + custom_state;
     }
     return "hb-state-open";
  }.property("data.current_state", "customState", "data.state", "data.other_labels.[]"),

  //Relationships
  cardRelationships: function(){
    var html_body = this.get('body_html');
    return CardRelationshipParser.parse(html_body);
  }.property('data.body_html'),
  buildIssueReferences: function(){
    if(this.get('repo.board')){
      this.accept(issueReferenceVisitor);
    }
  }.observes('repo.board', 'data.body_html'),

  loadDetails: function () {
    this.set("processing", true);
    return Ember.$.getJSON(`${this.get("apiUrl")}/details`)
    .success(function(details){
      this.set("data.repo", details.repo);
      this.set("data.activities", details.activities);
      this.set("processing", false);
    }.bind(this)).fail(function(){
      this.set("processing", false);
    }.bind(this));
  },
  update: function(){
    //!! This request has to return the jqHXR obj, no then's
    return Ember.$.ajax({
      url: `${this.get("apiUrl")}`,
      type: "PUT",
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({
        title: this.get("title"),
        body: this.get("body")
      })
    });
  },
  updateLabels : function (label, action) {
    this.set("processing", true);
    this.checkForStateChange(label);
    return Ember.$.ajax( {
      url: `${this.get("apiUrl")}/${action}`,
      data: JSON.stringify({
        labels: this.data.other_labels,
        correlationId: this.get("correlationId"),
        selectedLabel: label,
        action: action
      }),
      dataType: 'json',
      type: "PUT",
      contentType: "application/json"})
      .then(function(){
        this.set("processing", false);
        if(this.isStateLabel(label) && action === 'unlabel'){
          this.set('customState', '');
        }
      }.bind(this));
  },
  checkForStateChange: function(label){
    if(this.isStateLabel(label)){
      var conflict_state = label.name.toLowerCase() === 'blocked' ? 'ready' : 'blocked';
      var conflict_label = this.get('other_labels').find((label)=>{
        return label.name.toLowerCase() === conflict_state;
      });
      this.get('other_labels').removeObject(conflict_label);
    }
  },
  isStateLabel: function(label){
    var name = label.name.toLowerCase();
    return name === 'blocked' || name === 'ready';
  },
  reorder: function (index, column) {
    var changedColumns = this.get("data.current_state.index") !== column.data.index;
    if(changedColumns){ this.set("data._data.custom_state", ""); }

    var state_label = this.get('other_labels').find((l)=> { return this.isStateLabel(l)});
    this.get('other_labels').removeObject(state_label);

    this.set("data.current_state", column.data);
    this.set("data._data.order", index);
    return Ember.$.post(`${this.get("apiUrl")}/dragcard`, {
      order: index.toString(),
      column: column.data.index.toString(),
      moved_columns: changedColumns,
      correlationId: this.get("correlationId")
    }, function( response ){
      this.set("data.body", response.body);
      this.set("data.body_html", response.body_html);
      if(changedColumns && state_label){ this.updateLabels(state_label, 'unlabel'); }
      return this;
    }.bind(this), "json");
  },
  close: function () {
    this.set("processing", true);
    return Ember.$.post(`${this.get("apiUrl")}/close`, {
      correlationId: this.get("correlationId")
    }, function(){}, "json").then(function(response) {
      this.set("data.state","closed");
      this.set("processing", false);
      return response;
    }.bind(this)).fail(function(){
      this.set("processing", false);
    }.bind(this));
  },
  reopenIssue: function(){
    this.set("processing", true);
    return Ember.$.post(`${this.get("apiUrl")}/open`, {
      correlationId: this.get("correlationId")
    }, function(){}, "json").then(function(response) {
      this.set("data.state","open");
      this.set("processing", false);
      return response;
    }.bind(this)).fail(function(){
      this.set("processing", false);
    }.bind(this));
  },
  assignUsers: function(logins){
    var _self = this;
    return Ember.$.post(`${this.get("apiUrl")}/assigncard`, {
      assignees: logins, 
      correlationId: this.get("correlationId")
    }, function(){}, "json").then(function( response ){
      _self.set("assignee", response.assignee);
      return _self;
    });
  },
  unassignUsers: function(logins){
    var _self = this;
    return Ember.$.post(`${this.get("apiUrl")}/unassigncard`, {
      assignees: logins, 
      correlationId: this.get("correlationId")
    }, function(){}, "json").then(function( response ){
      _self.set("assignee", response.assignee);
      return _self;
    });
  },
  assignMilestone: function(index, milestone){
    var changedMilestones = false;
    if(milestone && !this.get("milestone")){
      changedMilestones = true;
    } else if(!milestone && this.get("milestone")){
      changedMilestones = true;
    } else if (milestone) {
      changedMilestones = this.get("milestone.number") !== milestone.number;
    }
    this.set("_data.milestone_order", index);
    this.set("milestone", milestone);
    
    return Ember.$.post(`${this.get("apiUrl")}/assignmilestone`, {
      order: index.toString(),
      milestone: milestone ? milestone.number : null,
      changed_milestones: changedMilestones,
      correlationId: this.get("correlationId")
    }, function(){}, "json");
  },
  stateLabelName: function(){
    return this.get('other_labels').map((label)=>{return label.name.toLowerCase()}).find((name)=>{
      return name === 'blocked' || name === 'ready';
    }) || '';
  }.property('data.other_labels.[]'),
  customState: Ember.computed("data._data.custom_state", "data.other_labels.[]", "stateLabelName", {
    get:function(){
      //Prevents stateLabelName from overriding archived state
      if(this.get("_data.custom_state") === "archived"){ return "archived" }

      var state = this.get("stateLabelName");
      if(state){ return state; }
      return this.get("_data.custom_state");
    },
    set: function (key, value) {
      var previousState = this.get("stateLabelName") || this.get("_data.custom_state");
      this.set("_data.custom_state", value);

      var endpoint = value === "" ? previousState : value;
      if(!endpoint){ return; }
      var options = {
        dataType: "json",
        data: {correlationId: this.get("correlationId")},
        type: value === "" ? "DELETE" : "PUT",
        url: `${this.get("apiUrl")}/${endpoint}`
      };

      this.set("processing", true);
      Ember.$.ajax(options)
      .then(function(response){
        this.set("processing", false);
        this.set("data.body", response.body);
        this.set("data.body_html", response.body_html);
        this.set("other_labels", response.other_labels);
      }.bind(this));

      return value;
    },
  }),
  submitComment : function (markdown) {
    this.set("processing", true);
    return Ember.$.post(`${this.get("apiUrl")}/comment`, {
      markdown: markdown,
      correlationId: this.get("correlationId")
    }).then(function(response){
        this.set("processing", false);
        this.incrementProperty('data.comments');
        return response;
      }.bind(this));
  },
  closeAndMove: function () {
    var column = this.get("repo.board.columns.lastObject");
    var order = this.data._data.order;

    if(this.data.current_state.index !== column.data.index){
      order = this.get("repo.board.topIssueOrder") / 2;
    }

    return Ember.$.post(`${this.get("apiUrl")}/dragcard`, {
      order: order.toString(),
      column: column.data.index.toString(),
      moved_columns: true,
      correlationId: this.get("correlationId"),
      data: {state: "closed"}
    }, function( response ){
      this.set("data.body", response.body);
      this.set("data.body_html", response.body_html);
      return this;
    }.bind(this), "json");
  },
  runMaxMinOrderFix: function(){
    var order = this.maxMinOrderFix(this.get('order'));
    var milestone_order = this.maxMinOrderFix(this.data._data.milestone_order);

    if(order !== this.get('order')){
      this.set('order', order);
    }
    if(milestone_order !== this.data._data.milestone_order){
      this.data._data.milestone_order = milestone_order;
    }
  }.on('init'),
  maxMinOrderFix: function(order){
    if(order <= 0 || order === Infinity){ order = this.get('data.id') * Number.MIN_VALUE; }
    while(order < 1e-319){ order *= 10; }
    while(order > 1e307){ order /= 10; }
    return order;
  },
  columnObserver: function(){
    if(this.get('state') === 'closed'){
      var last_column = this.get('repo.board.columns.lastObject.data');
      this.set('current_state', last_column);
    }
  }.observes('repo.board.columns', 'state')
});

export default Issue;
