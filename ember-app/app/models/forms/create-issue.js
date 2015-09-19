import Ember from 'ember';
import correlationId from 'app/utilities/correlation-id';
console.log("TODO change path once new issue is normalized");
import Issue from 'app/models/new/issue';
import Serializable from 'app/mixins/serializable';

var CreateIssue = Ember.Object.extend(Serializable,{
  correlationId: correlationId
});

CreateIssue.reopenClass({
  createNew: function(){
     return CreateIssue.create({
       id: null,
       title: "",
       body: "",
       assignee: null,
       milestone: null,
       labels: []
     });
  }
});

export default CreateIssue;
