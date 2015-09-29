import Ember from 'ember';

var UnauthorizedController = Ember.Controller.extend({
  authLevel: function(){
    return App.get("authLevel").capitalize();
  }.property("authLevel"),

  loginUrl: function(){
    var url = "/login/" + App.get("authLevel") + "?redirect_to=/";
    var location = this.get("model.repo.full_name");
    var redirectParam = encodeURIComponent(location);
    return url + redirectParam;
  }.property("authLevel"),
});

export default UnauthorizedController;
