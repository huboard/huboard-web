import Ember from 'ember';
import SortableMixin from "app/mixins/cards/sortable";
import ScrollingColumn from "app/mixins/scrolling/column";

var HbColumnComponent = Ember.Component.extend(SortableMixin, ScrollingColumn, {
  classNames: ["column"],
  classNameBindings:["isCollapsed:hb-state-collapsed","isHovering:hovering", "isTaskColumn:hb-task-column", "isTaskColumn:task-column"],
  isTaskColumn: true,
  cards: Ember.A(),
  filters: Ember.inject.service(),

  columns: Ember.computed.alias("model.columns"),
  visibleIssues: function(){
    if(this.get('filteres.active')){
      return this.get("sortedIssues");
    }
    var index = this.get('cardIndex') + this.get('maxCardCount');
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
  maxCardCount: 10,
  scrollingDown: function(){
    var totalLength = this.get('sortedIssues').length;
    var index = this.get('cardIndex') + 1;
    var maxCards = this.get('maxCardCount');
    this.set('cardIndex', index);

    if(totalLength <= maxCards){ return; }
    if(this.get('visibleIssues.length') < totalLength){
      this.revealIssue();
    }
  }.on('columnScrolledDown'),
  revealIssue: function(){
    var lastItem =  this.get('visibleIssues.lastObject');
    lastItem = this.get('visibleIssues').indexOf(lastItem);
    var issue = this.get('sortedIssues').objectAt(lastItem + 1);
    this.get('visibleIssues').pushObject(issue);
    this.set('cardIndex', lastItem);
    this.$('.cards').superSortable('refresh');
  },
  scrollingUp: function(){
    var maxCards = this.get('maxCardCount');
    var totalLength = this.get('sortedIssues').length;
    var index = this.get('cardIndex') - 1;
    this.set('cardIndex', index);

    if(totalLength <= maxCards){ return; }
    if(index < totalLength && index > maxCards){
      this.hideIssue();
    }
  }.on('columnScrolledUp'),
  hideIssue: function(){
    var lastItem =  this.get('visibleIssues.lastObject');
    lastItem = this.get('visibleIssues').indexOf(lastItem);
    this.get('visibleIssues').removeAt(lastItem);
    this.set('cardIndex', lastItem);
    this.$('.cards').superSortable('refresh');
  }
});

export default HbColumnComponent;
