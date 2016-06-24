import Ember from 'ember';

var CardAssigneesVisitor = Ember.Object.create({
  visit: function(card){
    var assignees = card.get('issue.assignees');
    if(card.get('isFiltered') || !assignees){ return; }
    
    assignees = this.checkForFilteredAssignees(card, assignees);
    assignees = assignees.slice(0,3);
    card.set('visibleAssignees', assignees); 
  },
  
  //If the assignees match any assignee/member filters, display those assignees instead
  checkForFilteredAssignees: function(card, assignees){
    var active_filters = card.get('filters.memberFilters').filter((filter)=>{ return filter.mode > 0 });
    if(active_filters.length){
      return assignees.filter((assignee) => {
        return active_filters.isAny('name', assignee.login);
      });
    }
    return assignees;
  },
});

export default CardAssigneesVisitor;
