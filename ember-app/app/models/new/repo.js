import Ember from 'ember';
import Model from '../model';
import Board from './board';
import Issue from './issue';
import Milestone from './milestone';
import Integration from 'app/models/integration';
import Health from 'app/models/health';
import ajax from 'ic-ajax';
import correlationId from 'app/utilities/correlation-id';

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
    get: function(key) {
      return this.get('loadFailed') ||
        (this.get('parent') &&
         this.get('columns.length') !== this.get('parent.columns.length'));
    }
  }), 
  health: Ember.computed({
    get: function(key){
      return PromiseObject.create({
        promise: Health.fetch(this)
      });
    }
  }),
  unhealthy: Ember.computed('health.isFulfilled', {
    get: function(){
      var health = this.get('health');
      if(health.get('isFulfilled')){
        return health.get('content.hasErrors')
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
        })
        if(repo) {
          response.pushObject(repo);
        } else {
          var repo = Repo.create({ data: link });
          repo.set('parent', self);
          response.pushObject(repo);
        }
      } else {
        var repo = Repo.create({ data: link });
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
    return this.get('ajax')(`${this.get('baseUrl')}/details`).then(function(details){
      // map the issues
      var issues = details.data.issues.map((x) => Issue.create({data: x, repo: repo}));
      repo.set('issues', issues);

      //map the milestones
      var milestones = details.data.milestones.map((x) => Milestone.create({data: x, repo: repo}));
      repo.set('milestones', milestones);

      repo.set('other_labels', details.data.other_labels);
      repo.set('assignees', details.data.assignees);
      repo.set('columns', details.data.columns);

      return repo;
    }, function(jqxhr) {
      repo.set('isLoaded', false);
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
  createLink(name) {
    var parent = this;
    return ajax({
      url: `/api/${this.get('data.repo.full_name')}/links/validate`,
      dataType: 'json',
      type: 'POST',
      data: {
        link: name
      }
    }).then(() => {
      return ajax({
        url: `/api/${this.get('data.repo.full_name')}/links`,
        dataType: 'json',
        type: 'POST',
        data: {
          link: name
        }
      }).then((response) => {
        parent.get('data.links').pushObject(response);
        return parent.get('links.lastObject').load().then((repo) => {
          if(!repo.get('loadFailed')){
            var board = Board.create({repo: repo});
            repo.set('isLoaded', true);
            repo.set('board', board);
          }
        });
      });
    });
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
        var issue = Issue.create({data: response, repo: repo});
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
    })
  }
});

export default Repo;
