import Ember from 'ember';
import SortableMixin from "huboard-app/mixins/cards/sortable";
import ScrollingColumn from "huboard-app/mixins/scrolling/column";

var HbColumnComponent = Ember.Component.extend(SortableMixin, ScrollingColumn, {
  classNames: ["column"],
  classNameBindings:["isCollapsed:hb-state-collapsed","isHovering:hovering", "isTaskColumn:hb-task-column", "isTaskColumn:task-column", "columnsClass"],

  columnsClass: Ember.computed('model.columns.[]', {
    get() {
      return `columns-${this.get('model.columns.length')}`;
    }
  }),
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
  }.property('sortedIssues.[]', 'filters.allFilters.[]', 'filters.active', 'cardIndex'),
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
    Ember.run.schedule("afterRender", this, function(){
      issue.reorder(order, this.get("model"));
      this.notifyPropertyChange('sortedIssues');
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
  isCreateVisible: function(){
    return this.get('model.isFirstColumn') && App.get('loggedIn');
  }.property("model.isFirstColumn"),
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
        milestone_order: this.cardMover.moveToTop(top_milestone_issue, 'milestone_order')
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
    var horizon = this.get('scrollHorizon');
    var totalColumnLength = this.get('sortedIssues').length;
    if(totalColumnLength <= horizon || this.get('issuesAreHiding')){ return; }

    var scrollTop = this.$('.cards').scrollTop();
    var scrollHeight = this.$('.cards')[0].scrollHeight;
    var clientHeight = this.$('.cards')[0].clientHeight;
    var horizonVisible = (scrollHeight * 0.75) - scrollTop < clientHeight;

    var issuesLength = this.get('visibleIssues').length;
    if(horizonVisible && issuesLength < totalColumnLength){
      Ember.run.throttle(this, 'revealIssues' , horizon, 200);
    }
  }.on('columnScrolledDown'),
  revealIssues: function(horizon){
    var lastItem =  this.get('visibleIssues.lastObject');
    lastItem = this.get('visibleIssues').indexOf(lastItem);
    this.set('cardIndex', lastItem + horizon);
  },
  ////
  //
  // Pruning issues on scroll up is still somewhat unreliable, commenting out
  //
  //scrollingUp: function(){
  //  var horizon = this.get('scrollHorizon');
  //  var totalColumnLength = this.get('sortedIssues').length;
  //  if(totalColumnLength <= horizon){ return; }

  //  var scrollTop = this.$('.cards').scrollTop();
  //  var horizonVisible = scrollTop < 500;

  //  if(horizonVisible && !this.get('freezeIssueArray')){
  //    this.set('issuesAreHiding', true);
  //    this.hideIssues(horizon);
  //  }
  //}.on('columnScrolledUp'),
  //hideIssues: function(){
  //  this.set('cardIndex', 1);
  //  Ember.run.schedule('afterRender', ()=>{
  //    this.set('issuesAreHiding', false);
  //  });
  //},
  refreshSortable: function(){
    Ember.run.next(()=>{
      this.$('.cards').superSortable('refresh');
    });
  }.observes('cardIndex')
});

export default HbColumnComponent;
