import Ember from 'ember';
import correlationId from 'huboard-app/utilities/correlation-id';
import Serializable from 'huboard-app/mixins/serializable';

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
       assignees: [],
       milestone: null,
       labels: []
     });
  }
});

export default CreateIssue;
