import Ember from 'ember';
import SortableMixin from "app/mixins/cards/sortable";
import ScrollingColumn from "app/mixins/scrolling/column";
import isElementInViewport from "app/helpers/element-in-viewport";

var HbColumnComponent = Ember.Component.extend(SortableMixin, ScrollingColumn, {
  classNames: ["column"],
  classNameBindings:["isCollapsed:hb-state-collapsed","isHovering:hovering", "isTaskColumn:hb-task-column", "isTaskColumn:task-column"],

  isTaskColumn: true,
  cards: Ember.A(),
  filters: Ember.inject.service(),

  columns: Ember.computed.alias("model.columns"),
  visibleIssues: function(){
    if(this.get('filters.active')){
      return this.get("sortedIssues");
    }
    var index = this.get('cardIndex') + this.get('scrollHorizon');
    return this.get("sortedIssues").slice(0, index);
  }.property('sortedIssues.[]', 'filters.allFilters.[]'),
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
    var issues = this.get("model.sortedIssues");
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
  }.property("model.sortedIssues.[]"),

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

  
  //Column Scrolling

  //The starting index to track the scroll
  cardIndex: 1,

  //Max number of cards allowed to render initially
  scrollHorizon: 40,
  scrollingDown: function(){
    if(this.get('filters.active')){
     return;
    }
    var horizon = this.get('scrollHorizon');
    var totalColumnLength = this.get('sortedIssues').length;
    if(totalColumnLength <= horizon){ return; }

    var cardsLength = this.get('visibleCards').length;
    var cardElement = this.get('visibleCards')[cardsLength - 5].$()[0];
    var horizonVisible = isElementInViewport(cardElement);

    var issuesLength = this.get('visibleIssues').length;
    if(horizonVisible && issuesLength < totalColumnLength){
      this.revealIssues(horizon);
    }
  }.on('columnScrolledDown'),
  revealIssues: function(horizon){
    var lastItem =  this.get('visibleIssues.lastObject');
    lastItem = this.get('visibleIssues').indexOf(lastItem);
    var issues = this.get('sortedIssues').slice(lastItem + 1, lastItem + horizon);
    this.get('visibleIssues').pushObjects(issues);
    this.set('cardIndex', lastItem + horizon);
    Ember.run.next(()=>{
      this.$('.cards').superSortable('refresh');
    });
  },
  scrollingUp: function(){
    if(this.get('filters.active')){
     return;
    }
    var horizon = this.get('scrollHorizon');
    var totalColumnLength = this.get('sortedIssues').length;
    if(totalColumnLength <= horizon){ return; }

    var cardElement = this.get('visibleCards.firstObject').$()[0];
    var horizonVisible = isElementInViewport(cardElement);

    if(horizonVisible){
      this.hideIssues(horizon);
    }
  }.on('columnScrolledUp'),
  hideIssues: function(horizon){
    if(this.get('freezeIssueArray')){ return; }

    var lastItem =  this.get('visibleIssues').length;
    var issues = this.get('sortedIssues').slice(horizon, lastItem);
    this.get('visibleIssues').removeObjects(issues);
    this.set('cardIndex', 1);
  },
  visibleCards: function(){
    var issues = this.get('visibleIssues');
    return _.union(this.get('cards').filter((card)=>{
      return issues.find((issue)=>{
        return issue.get('id') === card.get('issue.id');
      });
    }));
  }.property('visibleIssues.[]')
});

export default HbColumnComponent;
