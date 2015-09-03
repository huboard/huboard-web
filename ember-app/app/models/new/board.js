import Ember from 'ember';
import Model from '../model';
import Column from './column';
import ajax from 'ic-ajax';


var Board = Model.extend({
  repo: null,
  repos: Ember.computed.alias('repo.repos'),  
  // these need to be real 
  filterMilestones: [],
  filterLabels: [],
  linkedRepos: [],
  combinedAssignees:[],
  combinedIssues: [],
  combinedMilestones: Ember.computed('repos.[]', function(){
    var milestones = this.get('repos')
    .map((r) => r.get('data.milestones'))
    .reduce((l,r) => l.concat(r));

    return Ember.ArrayProxy.extend(Ember.SortableMixin)
    .create({
      content: milestones,
      sortProperties: ['_data.order']
    });
  }),

  milestones: Ember.computed('repos.@each.milestones.[]', {
    get: function(key){
      
      var combined = this.get('repos')
        .map((x) => x.get('milestones'))
        .reduce((l, r) => l.concat(r)); 

      var groups = _.groupBy(combined, (x) => x.get('data.title').toLowerCase());

      var mapped = _.map(groups, (val, key) => {
        return Ember.Object.create({
          milestone: val[0],
          milestones: val
        })
      });

      return mapped;

    }
  }),
  
  columns: Ember.computed('data.columns', function(){
    var board = this,
    columns = this.get('data.columns');
    return columns.map(function(c, i){
      var column = Column.create({data: c});
      column.set('board', board);
      if(i === 0) { column.set('isFirst', true); }
      return column;
    });
  }),

  issues: Ember.computed('repos.@each.issues.[]', {
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
    var promises = repo.get('repos').map(function(r){
      return r.load();
    })
    return ajax(repo.get('baseUrl') + "/board").then(function(json){
      return Ember.RSVP.all(promises).then(function(repos){
        // could fetch issues here?
        var board = Board.create(json);
        board.set('repo', repo);
        repo.set('board', board);
        return board;
      });    
    });
  }
});

export default Board;

