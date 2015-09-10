import Ember from 'ember';
import Model from '../model';
import Board from './board';
import Issue from './issue';
import Milestone from './milestone';
import ajax from 'ic-ajax';

var PromiseObject = Ember.Object.extend(Ember.PromiseProxyMixin);
var Repo = Model.extend({
  parent: null,
  repos: Ember.computed('links.[]', function(){
    var repos = [this].concat(this.get('links'));
    return repos;
  }),
  isCollaborator: Ember.computed('data.repo.permissions.{admin,push}', function(){
    return this.get('data.repo.permissions.admin') || this.get('data.repo.permissions.push');
  }),
  isAdmin: Ember.computed.alias('data.repo.permissions.admin'),
  baseUrl: Ember.computed('data.repo.full_name', function () {
    return `/api/v2/${this.get('data.repo.full_name')}`;
  }),
  userUrl :function () {
    return "/" + this.get("data.repo.owner.login");
  }.property("data.repo.owner.login"),
  repoUrl :function () {
    return `${this.get('userUrl')}/${this.get("data.repo.name")}`;
  }.property("data.repo.name",'userUrl'),
  links: Ember.computed('data.links', function(){
    var self = this, 
    links = this.get('data.links');
    var response = Ember.A();
    links.forEach(function(link){
      var repo = Repo.create({ data: link });
      repo.set('parent', self);
      response.pushObject(repo);
    });
    return response;
  }),
  issuesLength: Ember.computed.alias('issues.length'),
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

      return repo;
    });
  },
  fetchSettings: function(){
    //TODO: move this to Settings.fetch(repo)
    // also make it cache for realzies :P
    if(this._settings) {return this._settings;}
    return Ember.$.getJSON("/api/" + this.get("data.repo.full_name") + "/settings");
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
        order: order
      })
    }).then((response) => {
      Ember.run.once(() => {
        var issue = Issue.create({data: response, repo: repo});
        repo.get('issues').pushObject(issue);
      });
    });
  }
});

export default Repo;
