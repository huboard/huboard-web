import correlationId from 'app/utilities/correlation-id';
import Serializable from 'app/mixins/serializable';
import Ember from 'ember';

var Issue = Ember.Object.extend(Serializable,{
  columnIndex: Ember.computed.alias("current_state.index"),
  order: Ember.computed.alias("_data.order"),
  milestoneOrder: Ember.computed.alias("_data.milestone_order"),
  milestoneTitle: Ember.computed.alias("milestone.title"),

  correlationId: correlationId,
  customState:Ember.computed("_data.custom_state", {
    get:function(){
      return this.get("_data.custom_state");
    },
    set: function (key, value) {
      if(value !== undefined) {
        var user = this.get("repo.owner.login"),
        repo = this.get("repo.name"),
        full_name = user + "/" + repo,
        previousState = this.get("_data.custom_state"),
        options = {dataType: "json", data:{correlationId: this.get("correlationId")}};

        this.set("_data.custom_state", value);
        this.set("processing", true);

        switch(value){
          case "ready": 
            Ember.$.extend(options, {
            url: "/api/" + full_name + "/issues/" + this.get("number") + "/ready",
            type: "PUT"
          });
          break;
          case "blocked":
            Ember.$.extend(options, {
            url: "/api/" + full_name + "/issues/" + this.get("number") + "/blocked",
            type: "PUT"
          });
          break;
          case "":
            Ember.$.extend(options, {
            url: "/api/" + full_name + "/issues/" + this.get("number") + "/" + previousState,
            type: "DELETE"
          });
          break;
        }

        Ember.$.ajax(options)
        .then(function(response){
          this.set("processing", false);
          this.set("body", response.body);
          this.set("body_html", response.body_html);
        }.bind(this));
        return value;
      }
      return this.get("_data.custom_state");
    }
  }),
  submitComment : function (markdown) {
    this.set("processing", true);
    var user = this.get("repo.owner.login"),
    repo = this.get("repo.name"),
    full_name = user + "/" + repo;

    return Ember.$.ajax( {
      url: "/api/" + full_name + "/issues/" + this.get("number") + "/comment", 
      data: JSON.stringify({ markdown: markdown, correlationId: this.get("correlationId")}),
      dataType: 'json',
      type: "POST",
      contentType: "application/json"})
      .then(function(response){
        this.set("processing", false);
        return response;
      }.bind(this));
  },
  updateLabels : function () {
    this.set("processing", true);
    var user = this.get("repo.owner.login"),
    repo = this.get("repo.name"),
    full_name = user + "/" + repo;

    return Ember.$.ajax( {
      url: "/api/" + full_name + "/issues/" + this.get("number"), 
      data: JSON.stringify({labels: this.serialize().other_labels, correlationId: this.get("correlationId")}),
      dataType: 'json',
      type: "PUT",
      contentType: "application/json"})
      .then(function(){
        this.set("processing", false);
      }.bind(this));
  },
  loadDetails: function () {
    this.set("processing", true);
    var user = this.get("repo.owner.login"),
    repo = this.get("repo.name"),
    full_name = user + "/" + repo;

    return Ember.$.getJSON("/api/" + full_name + "/issues/" + this.get("number") + "/details")
    .success(function(details){
      this.set("repo", details.repo);
      this.set("activities", details.activities);
      this.set("processing", false);
    }.bind(this)).fail(function(){
      this.set("processing", false);
    }.bind(this));
  },
  processing: false,
  loaded: false,
  archive: function() {
    this.set("processing", true);
    var user = this.get("repo.owner.login"),
    repo = this.get("repo.name"),
    full_name = user + "/" + repo;

    return Ember.$.post("/api/" + full_name + "/archiveissue", {
      number : this.get("number"),
      correlationId: this.get("correlationId")
    }, function(){}, "json").then(function () {
      this.set("processing", false);
      this.set("isArchived", true);
    }.bind(this)).fail(function(){
      this.set("processing", false);
    }.bind(this));
  },
  close: function () {
    this.set("processing", true);

    var user = this.get("repo.owner.login"),
    repo = this.get("repo.name"),
    full_name = user + "/" + repo;

    Ember.$.post("/api/" + full_name + "/close", {
      number : this.get("number"),
      correlationId: this.get("correlationId")
    }, function(){}, "json").then(function(response) {
      this.set("state","closed");
      this.set("activities", response.activities);
      this.set("processing", false);
    }.bind(this)).fail(function(){
      this.set("processing", false);
    }.bind(this));
  },
  reopenCard: function(){
    this.set("processing", true);

    var user = this.get("repo.owner.login"),
    repo = this.get("repo.name"),
    full_name = user + "/" + repo;

    Ember.$.post("/api/" + full_name + "/open", {
      number : this.get("number"),
      correlationId: this.get("correlationId")
    }, function(){}, "json").then(function(response) {
      this.set("state","open");
      this.set("activities", response.activities);
      this.set("processing", false);
    }.bind(this)).fail(function(){
      this.set("processing", false);
    }.bind(this));
  },
  assignUser: function(login){
    var user = this.get("repo.owner.login"),
    repo = this.get("repo.name"),
    full_name = user + "/" + repo;

    return Ember.$.post("/api/" + full_name + "/assigncard", {
      number : this.get("number"),
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

    var user = this.get("repo.owner.login"),
    repo = this.get("repo.name"),
    full_name = user + "/" + repo;

    return Ember.$.post("/api/" + full_name + "/assignmilestone", {
      issue : this.get("number"),
      order: index.toString(),
      milestone: milestone ? milestone.number : null,
      changed_milestones: changedMilestones,
      correlationId: this.get("correlationId")
    }, function(){}, "json");
  },
  reorder: function (index, column) {
    var changedColumns = this.get("current_state.index") !== column.index;
    if(changedColumns){
      this.set("_data.custom_state", "");
    }
    this.set("current_state", column);
    this.set("_data.order", index);

    var user = this.get("repo.owner.login"),
    repo = this.get("repo.name"),
    full_name = user + "/" + repo;

    return Ember.$.post("/api/" + full_name + "/dragcard", {
      number : this.get("number"),
      order: index.toString(),
      column: column.index.toString(),
      moved_columns: changedColumns,
      correlationId: this.get("correlationId")
    }, function( response ){
      this.set("body", response.body);
      this.set("body_html", response.body_html);
      return this;
    }.bind(this), "json");
  }

});

export default Issue;
