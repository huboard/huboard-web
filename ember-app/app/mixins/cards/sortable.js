import Ember from "ember";
import CardMoveMixin from "../cards/card-move";


var SortableMixin = Ember.Mixin.create(CardMoveMixin, {
   attachSortable: function(){

    var _self = this;
    var cardMove = this.cardMover;
    var columns = this.get("columnComponents");
    var newSortable = _self.get('newSortable');
    var sortableFx = newSortable ? "superSortable" : "sortable";
    this.$(".cards")[sortableFx]({
      appendTo: newSortable ? document.body : "parent",
      helper: function(ev,ui) {
        cardMove.data = {};
        cardMove.data.originIndex = ui.index();

        var column = cardMove.findColumn(ui, columns);
        var card = cardMove.findCard(ui, column);
        cardMove.data.card = card;
        var clone = ui.clone();
        clone.width(ui.outerWidth() - 12);
        return clone;
      },
      start: function(ev, ui){
        ui.placeholder.height(ui.helper.outerHeight());
        _self.set('freezeIssueArray', true);
      },
      items: ".is-draggable",
      placeholder: "ui-sortable-placeholder",
      connectWith: ".cards",
      stop: function(){
        _self.set('freezeIssueArray', false);
      },
      update: function(ev, ui){
        if (this !== ui.item.parent()[0]){return ;}

        var column = cardMove.findColumn(ui.item, columns);
        column.set('freezeIssueArray', false);
        cardMove.data.column = column;

        var index = ui.item.index();
        var column_changed = ui.sender;
        var mod = cardMove.indexModifier(index, column_changed);

        var issues = column.get("visibleIssues");
        var issue_above = cardMove.issueAbove(index, issues, mod);
        var issue_below = cardMove.issueBelow(index, issues, mod);

        var issue_order = cardMove.calculateIssueOrder(issue_above, issue_below);
        var issue = cardMove.data.card.get("issue");

        var cancelMove = function(){ 
          Ember.$(ui.sender)[sortableFx]("cancel");
        };
        var moveIssue = function(){
          column.moveIssue(issue, issue_order, cancelMove);
        };

        _self.executeAfterBrowserPaint(moveIssue);
      },
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
