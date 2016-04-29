import Ember from "ember";
import CardMoveMixin from "../cards/card-move";
import sortablejs from 'npm:sortablejs';

var SortableMixin = Ember.Mixin.create(CardMoveMixin, {
   classNameBindings:["isHovering:ui-sortable-hover"],
   isHovering: false,
   attachSortable: function(){
    var _self = this;
    var cardMove = this.cardMover;
    var columns = this.get("columnComponents");
//    return this.$(".cards").sortable();

    this.$(".cards").each(function(){
      var sortable = new sortablejs(this,{
        group: 'column',
        draggable: 'li.is-draggable',
        ghostClass: 'ui-sortable-placeholder',
        onMove: (evt) => {
          var to = $(evt.to);

          Ember.$('.cards').removeClass('hovering');
          to.addClass('hovering');
        },
        onStart: (evt) => {
          delete cardMove.data;
          cardMove.data = {};
          cardMove.data.originIndex = evt.oldIndex;
          
          var column = cardMove.findColumn(evt.item, columns);
          var card = cardMove.findCard(evt.item, column);
          cardMove.data.card = card;
        },
        onEnd: (evt) => {
          Ember.$('.cards').removeClass('hovering');
        },
        onSort: (evt) => {
          if(evt.item.parentNode !== evt.to) { return; }
          var column = cardMove.findColumn(evt.item, columns);
          cardMove.data.column = column;

          var index = evt.newIndex;
          var column_changed = evt.from;
          var mod = cardMove.indexModifier(index, column_changed);

          var issues = column.get("sortedIssues");
          var issue_above = cardMove.issueAbove(index, issues, mod);
          var issue_below = cardMove.issueBelow(index, issues, mod);

          var issue_order = cardMove.calculateIssueOrder(issue_above, issue_below);
          var issue = cardMove.data.card.get("issue");

          var cancelMove = function(){ 
            // TODO: figure out cancel
            alert('Have to figure out how to cancel!');
          };
          var moveIssue = function(){
            column.moveIssue(issue, issue_order, cancelMove);
          };

          _self.executeAfterBrowserPaint(moveIssue);
        }
      });
    });

  }.on("didInsertElement"),

  executeAfterBrowserPaint: function(callback){
    if(window.requestAnimationFrame){
      return window.requestAnimationFrame(callback);
    }
    callback();
  }
});

export default SortableMixin;
