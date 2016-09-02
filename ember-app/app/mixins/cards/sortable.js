import Ember from "ember";
import CardMoveMixin from "../cards/card-move";


var SortableMixin = Ember.Mixin.create(CardMoveMixin, {
   classNameBindings:["isHovering:ui-sortable-hover"],
   isHovering: false,
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
        return ui.clone();
      },
      //Keeps the sortable lists in sync across column drags when scrolling
      change: function(ev, ui){
        //Wait for the ui sender to kick in
        if(ui.sender){ cardMove.data.sender = ui.sender; }

        var columnLength = ui.helper.parent().find('.card').length
        if(cardMove.data.sender && columnLength !== cardMove.data.itemsLength ){
          Ember.$(cardMove.data.sender).superSortable('refresh');
          cardMove.data.itemsLength = columnLength;
        }
      },
      start: function(ev, ui){
        ui.placeholder.height(ui.helper.outerHeight());
        _self.set('freezeIssueArray', true);
      },
      items: ".is-draggable",
      placeholder: "ui-sortable-placeholder",
      connectWith: ".cards",
      over: function(){
        _self.set('isHovering', true);
      },
      out: function(){
        _self.set('isHovering', false);
      },
      stop: function(ev, ui){
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
