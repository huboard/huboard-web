import Ember from 'ember';
import Model from '../model';
import Column from './column';
import MilestoneColumn from './milestone_column';
import ajax from 'ic-ajax';


var Board = Model.extend({
  repo: null,
  repos: Ember.computed.alias('repo.repos'),  
  // these need to be real 
  // kill kill kill!
  linkedRepos: [],
  combinedIssues: [],
  labels: Ember.computed('repos.@each.labels.[]', {
    get: function(key){
      
      var combined = this.get('repos')
        .map((x) => x.get('other_labels'))
        .reduce((l, r) => l.concat(r)); 

      var groups = _.groupBy(combined, (x) => Ember.get(x,'name').toLowerCase());

      var mapped = _.map(groups, (val, key) => {
        return Ember.Object.create({
          label: val[0],
          labels: val
        })
      });

      return mapped;

    }
  }),

  milestones: Ember.computed('repos.@each.{milestonesLength,milestonesOrder}', 'issues.@each.milestoneTitle', {
    get: function(key){
      var board = this;
      
      var combined = this.get('repos')
        .map((x) => x.get('milestones'))
        .reduce((l, r) => l.concat(r)); 

      var groups = _.groupBy(combined, (x) => x.get('data.title').toLowerCase());

      var mapped = _.map(groups, (val, key) => {
        return Ember.Object.create({
          milestone: val[0],
          milestones: val,
          milestonesLength: Ember.computed.alias('milestones.length'),
          board: board
        })
      });

      return mapped.sort((a,b) => {
        return a.milestone.get("order") - b.milestone.get("order");
      });
    }
  }),
  milestone_columns: Ember.computed(
    'repos.@each.milestonesLength', 'issues.@each.milestoneTitle', {
    get: function(key){
      var board = this;

      var columns = this.get('milestones')
        .map((x) => MilestoneColumn.create(x));

      columns.insertAt(0, MilestoneColumn.create({
        milestone: null, 
        milestones:[],
        board: board
      }));
      return columns;
    }
  }),
  columns: Ember.computed('repo.columns.[]', function(){
    var board = this,
    columns = this.get('repo.columns');
    return columns.map(function(c, i){
      var column = Column.create({data: c});
      column.set('board', board);
      //Ricki: If we ever allow huboard created columns 
      //this would hurt us
      //if(i === 0) { column.set('isFirst', true); }
      return column;
    });
  }),

  issues: Ember.computed('repos.@each.issuesLength', {
    get: function(key){
      var combined = this.get('repos')
        .map((x) => x.get('issues'))
        .reduce((l, r) => l.concat(r)); 
      return combined;
    }
  })
});

Board.reopenClass({
  fetch: function(repo){
    if(repo.get('isLoaded')){
      return Ember.RSVP.resolve(repo.get('board'));
    }
    var promises = repo.get('repos').map(function(r){
      return r.load();
    })
    return Ember.RSVP.all(promises).then(function(repos){
      // could fetch issues here?
      repos.forEach((x) => {
        if(!x.get('hasErrors')){
          var board = Board.create({repo: x});
          x.set('board', board);
          x.set('isLoaded', true);
        }
      });
      
      return repo.get('board');
    });    
  }
});

export default Board;

