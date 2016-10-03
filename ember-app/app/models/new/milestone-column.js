import Ember from 'ember';


var MilestoneColumn = Ember.Object.extend(Ember.PromiseProxyMixin, {
  isFirst: false,
  isLast: false,
  title: Ember.computed('milestone', 'milestone.data.title', {
    get: function(){
      return this.get('milestone') ? this.get('milestone.title') : "No milestone";
    }
  }),
  filterBy: function(i) {
    if(this.get('model.milestone')) {
    return i.data.milestone && i.data.milestone.title.toLowerCase() === this.get('model.milestone.data.title').toLowerCase();
    }
    return !!!i.data.milestone;
  },
  issues: Ember.computed('board.issues.[]', {
    get: function(){
      var _self = this;
      return this.get('board.issues').filter((i) => {
        return i.get("milestone.id") === _self.get("milestone.id");
      });
    }
  }),
});

export default MilestoneColumn;
