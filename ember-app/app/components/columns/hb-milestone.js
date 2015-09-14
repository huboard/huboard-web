import Ember from "ember";
import HbColumn from "../columns/hb-column";
import MilestoneSubscriptions from 'app/mixins/subscriptions/milestone';
import Messaging from 'app/mixins/messaging';

var HbMilestoneComponent = HbColumn.extend(
  MilestoneSubscriptions, Messaging, {
  classNames: ["milestone"],
  classNameBindings:["isFirstColumn:no-milestone"],
  isTaskColumn: false,

  sortedIssues: function () {
    var issues = this.get("issues").filter(function(i){
        return !i.get("isArchived");
      })
      .filter(this.get("model.filterBy").bind(this))
      .sort(this.sortStrategy);
    return issues;
  }.property("issues.@each.{milestoneOrder,milestoneTitle}"),
  sortStrategy: function(a,b){
    if(a.data._data.milestone_order === b.data._data.milestone_order){
      if(a.repo.data.repo.full_name === b.repo.data.repo.full_name){
        return a.data.number - b.data.number;
      }
      return a.repo.data.repo.full_name - b.repo.data.repo.full_name;
    }
    return a.data._data.milestone_order - b.data._data.milestone_order;
  },
  moveIssue: function(issue, order, cancelMove){
    if(this.get("model.noMilestone")){
      return this.assignMilestone(issue, order, null);
    }

    var findMilestone = this.findMilestone(issue.repo);
    var milestone = this.get("model.group").find(findMilestone);
    if(!milestone){
      return this.handleMissingMilestone(issue, order, cancelMove);
    }
    this.assignMilestone(issue, order, milestone);
  },
  assignMilestone: function(issue, order, milestone){
    this.get("sortedIssues").removeObject(issue);
    var _self = this;
    Ember.run.schedule("afterRender", _self, function(){
      issue.assignMilestone(order, milestone);
    });
  },
  findMilestone: function(a){
    return function(b){
      return _.isEqual(a.name, b.repo.name);
    };
  },
  handleMissingMilestone: function(issue, order, cancelMove){
    var _self = this;
    this.attrs.createMilestoneOrAbort({
      card: issue,
      column: _self.get("model"),
      onAccept: function(milestone){
        _self.get("model.group").pushObject(milestone);
        _self.moveIssue(issue, order);
      },
      onReject: function(){
        cancelMove();
      }
    });
  },

  isCreateVisible: true,
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
      var order = { milestone_order: issues.get("firstObject.data._data.milestone_order") / 2};
      if(first){
        order.order = first.data._data.order / 2;
      }
      return order;
    } else {
      if(first){
        return { order: first.data._data.order / 2 };
      }
      return {};
    }
  }.property("sortedIssues.[]"),
  isFirstColumn: function(){
    return this.get("columns.firstObject.title") === this.get("model.title");
  }.property("columns.firstObject"),
  isCollapsed: Ember.computed({
    get: function(){
      return this.get("settings.milestoneColumn" + this.get("model.milestone.number") + "Collapsed");
    },
    set: function(key, value){
      this.set("settings.milestoneColumn" + this.get("model.milestone.number") + "Collapsed", value);
      return value;
    }
  }).property(),
});

export default HbMilestoneComponent;
