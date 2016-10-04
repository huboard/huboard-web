import Ember from 'ember';
import Model from '../model';
import Column from './column';
import MilestoneColumn from './milestone-column';


var Board = Model.extend({
  repo: null,
  repos: Ember.computed.alias('repo.repos'),  
  labels: Ember.computed('repos.@each.labels.[]', {
    get: function(){
      
      var combined = this.get('repos')
        .map((x) => x.get('other_labels'))
        .reduce((l, r) => l.concat(r), []);

      var groups = _.groupBy(combined, (x) => Ember.get(x,'name').toLowerCase());

      var mapped = _.map(groups, (val) => {
        return Ember.Object.create({
          label: val[0],
          labels: val
        });
      });

      return mapped;

    }
  }),
  isUnhealthy: Ember.computed('repos.@each.unhealthy', {
    get: function(){
      return this.get('repos')
        .filter((x) => x.get('isAdmin'))
        .any((x) => x.get('unhealthy'));
    }
  }),
  milestones: Ember.computed('repos.@each.{milestonesLength,milestonesOrder}', 'issues.@each.milestoneTitle', {
    get: function(){
      var board = this;
      
      var combined = this.get('repos')
        .map((x) => x.get('milestones'))
        .reduce((l, r) => l.concat(r), []);

      var groups = _.groupBy(combined, (x) => x.get('data.title').toLowerCase());

      var mapped = _.map(groups, (val) => {
        return Ember.Object.create({
          milestone: val[0],
          milestones: val,
          milestonesLength: Ember.computed.alias('milestones.length'),
          board: board
        });
      });

      return mapped.sort((a,b) => {
        return a.milestone.get("order") - b.milestone.get("order");
      });
    }
  }),
  milestone_columns: Ember.computed('repos.@each.{milestonesLength,milestonesOrder}', {
    get: function(){
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
    return columns.map(function(c){
      var column = Column.create({data: c});
      column.set('board', board);
      return column;
    });
  }),

  issues: Ember.computed('repos.@each.issuesLength', {
    get: function(){
      var combined = this.get('repos')
        .map((x) => x.get('issues'))
        .reduce((l, r) => l.concat(r), []);
      return combined;
    }
  }),
  issuesById: function(){
    return _.indexBy(this.get('issues'), (issue)=> {
      return issue.get('id');
    });
  }.property('issues.[]'),
  issuesByRepo: function(){
    return _.groupBy(this.get('issues'), (issue)=> {
      return issue.get('repo.data.repo.full_name');
    });
  }.property('issues.[]'),
  topIssueOrder: function(){
    var issues = this.get("repo.parent") ? 
      this.get("repo.parent.board.issues") : this.get("issues");

    return issues.sortBy("order").get("firstObject.order") || 1;
  }.property("issues.@each.order", "repo.parent.board.issues.@each.order"),
  assignees: function(){
    var combined = _.flatten(this.get("repos").map(function(repo){
      return repo.get("assignees");
    }));

    return _.uniq(combined, (a) => a.login);
  }.property("repos.@each.assigneesLength"),
  avatars: (function () {
    var issues = this.get("issues");
    return this.get("assignees").filter(function (assignee) {
      return _.find(issues, function (issue) {
        if(issue.data.assignees){
          return issue.data.assignees.isAny("login", assignee.login);
        }
        return issue.data.assignee && issue.data.assignee.login === assignee.login;
      });
    });
  }).property("assignees.[]", "issues.@each.assignee"),
  fetchIssues: function(options){
    var promises = this.get('repos').map((repo)=>{
      return repo.fetchIssues(options);
    });

    return Ember.RSVP.all(promises).then((issues)=>{
      return _.flatten(issues);
    });
  }
});

Board.reopenClass({
  fetch: function(repo){
    if(repo.get('isLoaded')){
      return Ember.RSVP.resolve(repo.get('board'));
    }
    var promises = repo.get('repos').map(function(r){
      return r.load();
    });
    return Ember.RSVP.all(promises).then(function(repos){
      repos.forEach((x) => {
        if(!x.get('loadFailed')){
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

