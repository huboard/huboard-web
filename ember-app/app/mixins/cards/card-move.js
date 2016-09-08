import Ember from "ember";

var CardMoveMixin = Ember.Mixin.create({
  setTheOrderKey: function(){
    var is_column = this.toString().match(/hb-column/);
    var key = is_column ? "order" : "milestone_order";
    this.set("cardMover.orderKey", key);
  }.on("init"),

  cardMover: Ember.Object.create({
    calculateIssueOrder: function(issue_above, issue_below){
      var issue = this.data.card.get("issue.data");
      if(!issue_above && !issue_below){return issue._data.order; }
      if(!issue_above){ return this.moveToTop(issue_below); }
      if(!issue_below){ return this.moveToBottom(issue_above); }
      return this.move(issue, issue_above, issue_below);
    },
    move: function(issue, issue_above, issue_below){
      var above_order = issue_above._data[this.get("orderKey")];
      var below_order = issue_below._data[this.get("orderKey")];
      return (above_order + below_order) / 2;
    },
    moveToTop: function(issue_below, key){
      key = key ? key : this.get("orderKey");
      var below_order = issue_below._data[key];
      var order = below_order / this.orderMultiplier;

      if(order <= 0){ order = issue_below.get('data.id') * this.minThreshold; }
      while(order < this.minThreshold){ order *= 10; }

      return order;
    },
    moveToBottom: function(issue_above, key){
      key = key ? key : this.get("orderKey");
      var above_order = issue_above._data[key];
      var order = above_order * this.orderMultiplier;

      if(order === Infinity){ order = this.maxThreshold / 1e10 * issue_above.get('data.id'); }
      while(order > this.maxThreshold){ order /= 10; }

      return order;
    },
    findCard: function(element, column){
      return column.get("cards").find(function(card){
        return card.$().is(element);
      });
    },
    findColumn: function(element, columns){
      return columns.find(function(column){
        return column.$().is(Ember.$(element).closest(".column"));
      });
    },
    issueAbove: function(index, issues, mod){
      if(index + mod && issues.length){
        return issues.objectAt((index + mod) - 1).data;
      }
      return null;
    },
    issueBelow: function(index, issues, mod){
      if(!(index + mod) && issues.length){  // jshint ignore:line
        return issues.objectAt(0).data;
      } else if((index + mod) !== (issues.length - 1)){
        var issue = issues.objectAt(index + mod);
        return issue ? issue.data : issue;
      } else if(index !== (issues.length - 1) && mod){
        return issues.objectAt(index + mod).data;
      } else if((index + mod) === issues.length - 1){
        return issues.get("lastObject").data;
      }
      return null;
    },
    indexModifier: function(index, column_changed){
      //Adjust based on issue dragging up or down
      if(column_changed){ return 0; }
      return index >= this.data.originIndex ? 1 : 0;
    },
    orderMultiplier: 1.0001,
    minThreshold: 1e-319,
    maxThreshold: 1e307
  })
});

export default CardMoveMixin;
