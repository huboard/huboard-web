import Ember from 'ember';
import correlationId from 'app/utilities/correlation-id';
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
       assignees: [],
       milestone: null,
       labels: []
     });
  }
});

export default CreateIssue;
