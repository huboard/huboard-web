import Ember from 'ember';
import Model from '../model';
import correlationId from 'app/utilities/correlation-id';

var Issue = Model.extend({
  blacklist: ["repo"],
  columnIndex: Ember.computed.alias("data.current_state.index"),
  order: Ember.computed.alias("data._data.order"),
  milestoneOrder: Ember.computed.alias("data._data.milestone_order"),
  milestoneTitle: Ember.computed.alias("milestone.title"),
  isArchived: function(){
    return this.get("customState") === "archived";
  }.property("customState"),
  correlationId: correlationId,
  assignee: Ember.computed.alias("data.assignee"),
  apiUrl: function(){
    var full_name = this.get("repo.data.repo.full_name");
    return `/api/${full_name}/issues/${this.get("data.number")}`;
  }.property("data.number", "repo.data.repo.full_name"),

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
    })
  },
  updateLabels : function (label, action) {
    this.set("processing", true);
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
      }.bind(this));
  },
  reorder: function (index, column) {
    var changedColumns = this.get("data.current_state.index") !== column.data.index;
    if(changedColumns){ this.set("data._data.custom_state", ""); }

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
  assignUser: function(login){
    return Ember.$.post(`${this.get("apiUrl")}/assigncard`, {
      assignee: login, 
      correlationId: this.get("correlationId")
    }, function(){}, "json").then(function( response ){
      this.set("assignee", response.assignee);
      return this;
    }.bind(this));
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
  customState: Ember.computed("data._data.custom_state", {
    get:function(){
      return this.get("_data.custom_state");
    },
    set: function (key, value) {
      var previousState = this.get("_data.custom_state")
      this.set("_data.custom_state", value);

      var endpoint = value === "" ? previousState : value;
      var number = this.get("data.number");
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
  }
});

export default Issue;
