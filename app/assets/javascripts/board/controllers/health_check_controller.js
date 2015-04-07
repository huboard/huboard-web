var HealthCheckController = Ember.ArrayController.extend({
  model: [],
  fetchHealthChecks: function(){
    var self = this;
    var repo = App.get("repo.full_name");
    self.set("processing", true);
    Ember.$.getJSON("/api/" + repo + "/healthcheck")
      .success(function(response){
        self.set("processing", false);
        self.set("model", response.data);
      });
  }.on("init"),
  failedHealthChecks: function(){
   return this.get("model").filter(function(h){
     return h.success === false && h.message !== "Not Authorized";
   });
  }.property("model.each"),
  processing: false,
});

module.exports = HealthCheckController
