import Ember from 'ember';
import ajax from 'ic-ajax';

var Link = Ember.Object.extend({});

Link.reopenClass({
  build: function(name, repo, labels){
    var validate_url = `/api/${repo}/links/validate`;
    var links_url = `/api/${repo}/links?labels=${labels}`;

    var request = this.request;
    var data = {link: name};
    return request(validate_url, data).then(()=> {
      return request(links_url, data);
    });
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
