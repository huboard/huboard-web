import Ember from 'ember';
import Model from '../model';
import Column from './column';
import ajax from 'ic-ajax';


var Board = Model.extend({
  repo: null,
  repos: Ember.computed('repo.links.[]', function(){
    var repos = [this.get('repo')].concat(this.get('repo.links'));
    return repos;
  }),
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
  fetchIssues:  function(board){
    var self = this;
    return new Ember.RSVP.Promise(function(resolve, reject){
      var repos = [self.get('repo')].concat(self.get('repo.links'));

      var promises = repos.map(function(repo){
        return Ember.get(repo,'issues'); 
      });

      Ember.RSVP.all(promises).then(function(issues) {
        var combined = issues.reduce((l, r) => l.concat(r)); 
        self.set('issues', combined);
        resolve(board);
      },reject);
    });
  }
});

Board.reopenClass({
  fetch: function(repo){
    return new Ember.RSVP.Promise(function(resolve, reject) {
      ajax(repo.get('baseUrl') + "/board").then(function(json){
        // could fetch issues here?
        var board = Board.create(json);
        board.set('repo', repo);
        repo.set('board', board);
        return board.fetchIssues(board).then(resolve, reject);
      }, reject);
    })
  }
});

export default Board;

