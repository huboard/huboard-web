import Ember from 'ember';
import correlationId from 'app/utilities/correlation-id';
console.log("TODO change path once new issue is normalized");
import Issue from 'app/models/new/issue';
import Serializable from 'app/mixins/serializable';

var CreateIssue = Ember.Object.extend(Serializable,{
  correlationId: correlationId,
  save: function(order) {
    var _self = this;
    return Ember.$.ajax( {
      url: "/api/" + this.get("repo.repo.full_name") + "/issues",
      data: JSON.stringify({issue: this.serialize(["repo"]), order: order, correlationId: this.get("correlationId") }),
      dataType: 'json',
      type: "POST",
      contentType: "application/json"})
      .then(function(response){
        return Issue.create({data: response, repo: _self.repo});
      });
  }
});

CreateIssue.reopenClass({
  createNew: function(){
     return CreateIssue.create({
       id: null,
       title: "",
       body: "",
       assignee: null,
       milestone: null,
       repo: App.get("repo"),
       labels: []
     });
  }
});

export default CreateIssue;
