import Ember from 'ember';
import ajax from 'ic-ajax';

var Link = Ember.Object.extend({});

Link.reopenClass({
  build: function(name, repo, issue_filter){
    var url = `/api/${repo}/links`;
    return this.request(url, {link: name, labels: issue_filter});
  },
  validate: function(name, repo){
    var url = `/api/${repo}/links/validate`;
    return this.request(url, {link: name});
  },
  update: function(link, repo){
    var name = link.data.repo.full_name;
    var issue_filter = link.data.issue_filter;
    var url = `/api/${repo}/links/update`;
    return this.request(url, {name: name, labels: issue_filter});
  },
  request: function(url, data){
    return ajax({
      url: url,
      dataType: 'json',
      type: 'POST',
      data: data
    })
  }
});

export default Link;
