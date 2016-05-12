import Ember from 'ember';

var UnauthorizedController = Ember.Controller.extend({
  flashMessages: Ember.inject.service(),
  clearFlashMessages: function(){
    this.get('flashMessages').clearMessages();
  }.on('init'),

  loginUrl: function(){
    var url = `/login/github?redirect_to=/`;
    var location = this.get("model.repo.full_name");
    var redirectParam = encodeURIComponent(location);
    return url + redirectParam;
  }.property("model.repo.full_name"),
});

export default UnauthorizedController;
