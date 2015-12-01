import Ember from 'ember';
import ajax from 'ic-ajax';

var Link = Ember.Object.extend({});

Link.reopenClass({
  build: function(name, repo, labels){
    var url = `/api/${repo}/links`;
    return this.request(url, {link: name, labels: labels});
  },
  validate: function(name, repo){
    var url = `/api/${repo}/links/validate`;
    return this.request(url, {link: name});
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
