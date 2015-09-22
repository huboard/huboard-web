import Ember from 'ember';

var IssueReopenController = Ember.Controller.extend({
  actions: {
    reopenIssue: function(){
      var _self = this;
      this.set("disabled", true);
      this.get("model.issue").reopenIssue().then(function(issue){
        _self.get("model.issue.data.state", issue.state);
        
        _self.set("disabled", false);
        _self.get("model").onAccept();
        _self.send("closeModal");
      });
    },
    closeModal: function(){
      if(!this.get("disabled")){ this.get("model").onReject(); }
      return true;
    }
  }
});

export default IssueReopenController;
