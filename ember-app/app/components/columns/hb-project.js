import Ember from "ember";
import HbColumn from "../columns/hb-column";
import Messaging from 'app/mixins/messaging';

var HbProjectComponent = HbColumn.extend(
  Messaging, {
  classNames: ["column"],
  isTaskColumn: true,

  //Scrolling Columns Tolerance
  _toleranceDown: 59,
  _toleranceUp: 70,

  sortedIssues: function () {
    var cards = this.get('model.cards');
    var issues = this.get("issues")
    .filter(function(issue){
      return cards.find(function(c){
        return Ember.get(c, 'content_url') == Ember.get(issue, 'url');
      }) != null;
    })
    return issues || [];
  }.property("issues.[]"),
  sortStrategy: function(a,b){
  },
  moveIssue: function(issue, order, cancelMove){
    // no-op
  },
  isCreateVisible: false,
  topOrderNumber: function(){
    var issues = this.get("issues")
      .filter(function(i) { return !i.get("isArchived");})
      .sort(this.sortStrategy);
    var first = this.get("issues")
      .filter(function(i) { return !i.get("isArchived");})
      .sort(function (a, b){
        return a.data._data.order - b.data._data.order;
      }).get("firstObject");
    if(issues.length){
      var milestone_order = this.cardMover.moveToTop(issues.get("firstObject.data"));
      var order = { milestone_order: milestone_order};
      if(first){
        order.order = this.cardMover.moveToTop(first.data, 'order');
      }
      return order;
    } else {
      if(first){
        return { order: this.cardMover.moveToTop(first.data, 'order') };
      }
      return {};
    }
  }.property("sortedIssues.[]"),
  isCollapsed: Ember.computed({
    get: function(){
      return this.get("settings.projectColumn" + this.get("model.number") + "Collapsed");
    },
    set: function(key, value){
      this.set("settings.projectColumn" + this.get("model.number") + "Collapsed", value);
      return value;
    }
  }).property(),
});

export default HbProjectComponent;
