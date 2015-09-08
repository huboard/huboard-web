import Ember from 'ember';
import Model from '../model';
import correlationId from 'app/utilities/correlation-id';

var Issue = Model.extend({
  columnIndex: Ember.computed.alias("data.current_state.index"),
  order: Ember.computed.alias("data._data.order"),
  milestoneOrder: Ember.computed.alias("data._data.milestone_order"),
  milestoneTitle: Ember.computed.alias("milestone.title"),
  correlationId: correlationId,
  assignee: Ember.computed.alias("data.assignee"),

  loadDetails: function () {
    this.set("processing", true);
    var user = this.get("data.repo.owner.login"),
    repo = this.get("data.repo.name"),
    full_name = user + "/" + repo;

    return Ember.$.getJSON("/api/" + full_name + "/issues/" + this.get("data.number") + "/details")
    .success(function(details){
      this.set("data.repo", details.repo);
      this.set("activities", details.activities);
      this.set("processing", false);
    }.bind(this)).fail(function(){
      this.set("processing", false);
    }.bind(this));
  },
  customState: Ember.computed("_data.custom_state", {
    get:function(){
      return this.get("_data.custom_state");
    },
    set: function (key, value) {
      var full_name = this.get("repo.data.repo.full_name");
      var previousState = this.get("_data.custom_state")

      this.set("_data.custom_state", value);
      this.set("processing", true);

      var endpoint = value === "" ? previousState : value;
      var number = this.get("data.number");
      var options = {
        dataType: "json",
        data: {correlationId: this.get("correlationId")},
        type: value === "" ? "DELETE" : "PUT",
        url: `/api/${full_name}/issues/${number}/${endpoint}`
      };

      Ember.$.ajax(options)
      .then(function(response){
        this.set("processing", false);
        this.set("data.body", response.body);
        this.set("data.body_html", response.body_html);
      }.bind(this));

      return value;
    },
  }),
  reorder: function (index, column) {
    var changedColumns = this.get("data.current_state.index") !== column.data.index;
    if(changedColumns){ this.set("data._data.custom_state", ""); }

    this.set("data.current_state", column.data);
    this.set("data._data.order", index);

    var full_name = this.get("repo.data.repo.full_name");
    return Ember.$.post("/api/" + full_name + "/dragcard", {
      number : this.get("data.number"),
      order: index.toString(),
      column: column.data.index.toString(),
      moved_columns: changedColumns,
      correlationId: this.get("correlationId")
    }, function( response ){
      this.set("data.body", response.body);
      this.set("data.body_html", response.body_html);
      return this;
    }.bind(this), "json");
  }
});

export default Issue;
