import Ember from 'ember';
import Model from '../model';
import Board from './board';
import Issue from './issue';
import Milestone from './milestone';
import Integration from 'huboard-app/models/integration';
import Health from 'huboard-app/models/health';
import Link from 'huboard-app/models/link';
import ajax from 'ic-ajax';
import correlationId from 'huboard-app/utilities/correlation-id';

const get = Ember.get;

var PromiseObject = Ember.Object.extend(Ember.PromiseProxyMixin);
var Repo = Model.extend({
  parent: null,
  repos: Ember.computed('links.[]', 'links.@each.hasErrors', function(){
    var repos = [this].concat(this.get('links').filter((r) => !r.get('hasErrors')));
    return repos;
  }),
  isCollaborator: Ember.computed('data.repo.permissions.{admin,push}', function(){
    return this.get('data.repo.permissions.admin') || this.get('data.repo.permissions.push');
  }),
  isAdmin: Ember.computed.alias('data.repo.permissions.admin'),
  hasErrors: Ember.computed('isLoaded', 'loadFailed', 'columns', 'columns.[]', {
    get: function() {
      return this.get('loadFailed') ||
        (this.get('parent') &&
         this.get('columns.length') !== this.get('parent.columns.length'));
    }
  }), 
  health: Ember.computed({
    get: function(){
      return PromiseObject.create({
        promise: Health.fetch(this)
      });
    }
  }),
  unhealthy: Ember.computed('health.isFulfilled', 'health.content.hasErrors', {
    get: function(){
      var health = this.get('health');
      if(health.get('isFulfilled')){
        return health.get('content.hasErrors');
      }
      return false;
    }
  }),
  baseUrl: Ember.computed('data.repo.full_name', function () {
    return `/api/v2/${this.get('data.repo.full_name')}`;
  }),
  userUrl :function () {
    return "/" + this.get("data.repo.owner.login");
  }.property("data.repo.owner.login"),
  repoUrl :function () {
    return `${this.get('userUrl')}/${this.get("data.repo.name")}`;
  }.property("data.repo.name",'userUrl'),
  links: Ember.computed('data.links.[]', function(){
    var self = this, 
    links = this.get('data.links');
    var response = Ember.A();
    if(!links) {
      return response;
    }
    links.forEach(function(link){
      if(self.__links) {
        var repo = self.__links.find((r) => {
          return get(r, 'data.repo.full_name') === get(link, 'repo.full_name');
        });
        if(repo) {
          response.pushObject(repo);
        } else {
          var repo = Repo.create({ data: link, socket: self.get('socket'), filters: self.get('filters') });
          repo.set('parent', self);
          response.pushObject(repo);
        }
      } else {
          var repo = Repo.create({ data: link, socket: self.get('socket'), filters: self.get('filters') });
        repo.set('parent', self);
        response.pushObject(repo);
      }
    });
    self.__links = response;
    return response;
  }),
  issuesLength: Ember.computed.alias('issues.length'),
  milestonesLength: Ember.computed.alias('milestones.length'),
  milestonesOrder: Ember.computed.alias('milestones.@each.order'),
  isLoaded: false,
  load: function(){
    var repo = this;
    var opts = {data: {issue_filter: repo.data.issue_filter || []}};
    return this.get('ajax')(`${this.get('baseUrl')}/details`, opts).then(function(details){
      // map the issues
      var issues = details.data.issues.map((x) => Issue.create({data: x, repo: repo, socket: repo.socket, filters: repo.filters}));
      repo.set('issues', issues);

      //map the milestones
      var milestones = details.data.milestones.map((x) => Milestone.create({data: x, repo: repo}));
      repo.set('milestones', milestones);

      repo.set('other_labels', details.data.other_labels);
      repo.set('assignees', details.data.assignees);
      repo.set('columns', details.data.columns);

      repo.set('isLoaded', true);
      repo.set('loadFailed', false);
      repo.set('issue_template', details.data.issue_template);

      return repo;
    }, function() {
      repo.set('isLoaded', true);
      repo.set('loadFailed', true);
      return repo;
    });
  },
  fetchIntegrations: function() {
    if(this._integrations) {return this._integrations;}
    return Ember.$.getJSON("/api/" + this.get("data.repo.full_name") + "/integrations")
      .then(function(integrations){
        var results = Ember.A();
        integrations.rows.forEach(function(i){
          results.pushObject(Integration.create(i.value));
        });
        this._integrations = Ember.Object.create({ 
          integrations: results 
        });
        return this._integrations;
      }.bind(this));

  },
  fetchSettings: function(){
    //TODO: move this to Settings.fetch(repo)
    // also make it cache for realzies :P
    if(this._settings) {return this._settings;}
    return Ember.$.getJSON("/api/" + this.get("data.repo.full_name") + "/settings");
  },
  createLink(name, issue_filter) {
    var parent = this;
    var repo = this.get('data.repo.full_name');
      
    return Link.build(name, repo, issue_filter).then((response) => {
      parent.get('data.links').pushObject(response);
      parent.set('links.lastObject.data.issue_filter', issue_filter);
      return parent.get('links.lastObject').load().then((repo) => {
        if(!repo.get('loadFailed')){
          var board = Board.create({repo: repo});
          repo.set('isLoaded', true);
          repo.set('board', board);
        }
      });
    });
  },
  updateLink: function(link){
    var link = this.get("links").find((l) => {
      return l.get("data.repo.full_name") === link.data.repo.full_name;
    });
    var repo = this.get('data.repo.full_name');

    return Link.update(link, repo).then((response) => {
      var issues = response.data.issues.map((x) => Issue.create({data: x, repo: link, socket: repo.socket, filters: repo.filters}));
      link.set('issues', issues);
      link.set('other_labels', response.data.other_labels);
      return link;
    });
  },
  validateLink: function(name){
    var repo = this.get('data.repo.full_name');
    return Link.validate(name, repo);
  },
  createMilestone: function(milestone, order) {
    var repo = this;
    return ajax({
      url: `/api/${this.get('data.repo.full_name')}/milestones`,
      dataType: 'json',
      type: 'POST',
      contentType: "application/json",
      data: JSON.stringify({
        milestone: milestone, 
        order: order,
        correlationId: correlationId
      })
    }).then((response) => {
       var milestone = Milestone.create({data: response, repo: repo});
       repo.get('milestones').pushObject(milestone);
       return milestone;
    });
  },
  createIssue: function(form, order){
    var issue = form.serialize(["repo"]),
      repo = this;
    if(issue.assignees && issue.assignees.length){
      issue.assignee = null;
      issue.assignees = issue.assignees.map((assignee)=>{  return assignee.login; });
    }
    return ajax({
      url: `/api/${this.get('data.repo.full_name')}/issues`,
      dataType: 'json',
      type: 'POST',
      contentType: "application/json",
      data: JSON.stringify({
        issue: issue, 
        order: order,
        correlationId: correlationId
      })
    }).then((response) => {
      Ember.run.once(() => {
        var issue = Issue.create({data: response, repo: repo, socket: repo.socket, filters: repo.filters});
        repo.get('issues').pushObject(issue);
      });
    });
  },
  fetchIssue: function(number){
    var repo = this.data.repo.full_name;
    return Ember.$.getJSON(`/api/${repo}/issues/${number}`);
  },
  updateComment: function(comment){
    //!! This request has to return the jqHXR obj, no then's
    var full_name = this.get("data.repo.full_name");
    return Ember.$.ajax({
      url: `/api/${full_name}/issues/comments/${comment.id}`,
      type: "PUT",
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({comment: comment})
    });
  },
  assigneesLength: function(){
    return this.get("assignees.length");
  }.property("assignees.[]"),
  fetchIssues: function(options){
    var url = `/api/${this.get('data.repo.full_name')}/issues`;
    return Ember.$.getJSON(url,{ options: options });
  }
});

export default Repo;
