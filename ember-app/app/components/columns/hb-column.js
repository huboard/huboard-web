import Ember from 'ember';
import SortableMixin from "app/mixins/cards/sortable";
import ScrollingColumn from "app/mixins/scrolling/column";

var HbColumnComponent = Ember.Component.extend(SortableMixin, ScrollingColumn, {
  classNames: ["column"],
  classNameBindings:["isCollapsed:hb-state-collapsed","isHovering:hovering", "isTaskColumn:hb-task-column", "isTaskColumn:task-column"],
  isTaskColumn: true,
  cards: Ember.A(),

  columns: Ember.computed.alias("model.columns"),
  visibleIssues: function(){
    return this.get('sortedIssues').slice(0, 10);
  }.property('sortedIssues.[]'),
  sortedIssues: function(){
    return this.get("model.sortedIssues");
  }.property("model.sortedIssues.@each.{columnIndex,order,state}"),
  moveIssue: function(issue, order, cancelMove){
    var self = this;
    if(issue.data.state === "closed" && !this.get("model.isLastColumn")){
      return this.attrs.reopenIssueOrAbort({
        issue: issue,
        column: self.get("model"),
        onAccept: function(){ self.moveIssue(issue, order); },
        onReject: function(){ cancelMove(); }
      });
    }

    this.get("model.sortedIssues").removeObject(issue);
    Ember.run.schedule("afterRender", self, function(){
      issue.reorder(order, self.get("model"));
    });
  },

  isCollapsed: Ember.computed({
    get: function(){
      return this.get("settings.taskColumn" + this.get("model.data.index") + "Collapsed");
    },
    set: function(key, value){
      this.set("settings.taskColumn" + this.get("model.data.index") + "Collapsed", value);
      return value;
    }
  }).property(),
  isCreateVisible: Ember.computed.alias("model.isFirstColumn"),
  topOrderNumber: function(){
    var issues = this.get("sortedIssues");
    var milestone_issues = this.get("issues").sort(function(a,b){
      return a.data._data.milestone_order - b.data._data.milestone_order;
    });
    if(issues.length){
      var top_issue = issues.get("firstObject.data");
      var top_milestone_issue = milestone_issues.get("firstObject.data");
      return {
        order: this.cardMover.moveToTop(top_issue),
        milestone_order: this.cardMover.moveToTop(top_milestone_issue)
      };
    } else {
      return {};
    }
  }.property("sortedIssues.[]"),

  registerWithController: function(){
    var _self = this;
    Ember.run.schedule("afterRender", this, function(){
      _self.attrs.registerColumn(_self);
    });
  }.on("didInsertElement"),
  unregisterWithController: function(){
    var _self = this;
    Ember.run.schedule("afterRender", this, function(){
      _self.attrs.unregisterColumn(_self);
    });
  }.on("willDestroyElement"),
  wireupIsCollapsed: function(){
    var self = this;
    this.$(".collapsed").click(function(){
      self.toggleProperty("isCollapsed");
    });
  }.on("didInsertElement"),

  disableModalOnHrefs: function () {
    this._super();
    this.$("a, .clickable").on("click.hbcard", function (ev){ ev.stopPropagation(); } );
  }.on("didInsertElement"),
  tearDownEvents: function () {
    this.$("a, .clickable").off("click.hbcard");
    return this._super();
  }.on("willDestroyElement"),

  cardIndex: 0,
  scrollingDown: function(){
    if(this.get('sortedIssues').length === 10){ return; }
    var index = this.get('cardIndex') + 1;
    if(index >= 0 && index < this.get('sortedIssues').length){
      var issue = this.get('sortedIssues').objectAt(index + 9);
      this.get('visibleIssues').pushObject(issue);
      this.set('cardIndex', index);
    }
  }.on('columnScrolledDown'),
  scrollingUp: function(){
    var length = this.get('sortedIssues').length;
    if(length === 10){ return; }
    var index = this.get('cardIndex') - 1;
    if(index < length && index > 10){
      var lastItem =  this.get('visibleIssues').length - 1;
      this.get('visibleIssues').removeAt(lastItem);
      this.set('cardIndex', index);
    }
  }.on('columnScrolledUp')
});

export default HbColumnComponent;
