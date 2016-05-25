import Ember from 'ember';
import ajax from 'ic-ajax';

var Link = Ember.Object.extend({});

Link.reopenClass({
  build: function(name, repo, issue_filter){
    var url = `/api/${repo}/links`;
    return this.request(url, {link: name, labels: issue_filter, type: "POST"});
  },
  validate: function(name, repo){
    var url = `/api/${repo}/links/validate`;
    return this.request(url, {link: name, type: "POST"});
  },
  update: function(link, repo){
    var name = link.data.repo.full_name;
    var issue_filter = link.data.issue_filter;
    var url = `/api/${repo}/links/update`;
    return this.request(url, {name: name, labels: issue_filter, type: "PUT"});
  },
  request: function(url, data){
    return ajax({
      url: url,
      dataType: 'json',
      type: data.type,
      data: data
    });
  }
});

export default Link;
