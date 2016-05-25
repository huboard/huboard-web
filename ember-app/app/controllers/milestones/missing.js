import Ember from 'ember';

var MilestonesMissingController = Ember.Controller.extend({
  card: Ember.computed.alias("model.card"),
  column: Ember.computed.alias("model.column"),
  disabled: false,
  actions: {
    closeModal: function(){
      if (this.get('disabled')) {
        return false;
      }
      this.get("model").onReject();
      return true;
    },
    createTheMilestone: function() {
      var controller = this,
        milestone = {
          title: this.get("column.title"),
          description: this.get("column.milestone.data.description"),
        };

      // GH API freaks out if you send a null due_on date
      if (this.get("column.milestone.data.due_on")) {
        milestone.due_on = this.get("column.milestone.data.due_on");
      }
          
      controller.set("disabled", true);

      return this.get('card.repo').createMilestone(milestone, {}).then(function(response){
        controller.get("model").onAccept(response);
        controller.set("disabled", false);
        controller.get('target').send('closeModal');
      });

    }
  }

});

export default MilestonesMissingController;
