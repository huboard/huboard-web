import Ember from 'ember';


var MilestoneColumn = Ember.Object.extend(Ember.PromiseProxyMixin, {
  isFirst: false,
  isLast: false,
  filterBy: function(i){
    return i.data.milestone && i.data.milestone.title.toLowerCase() === this.get('model.milestone.data.title').toLowerCase();
  }
});

export default MilestoneColumn;
