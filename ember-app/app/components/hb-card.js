import Ember from 'ember';
import template from 'app/templates/card';

var HbCardComponent = Ember.Component.extend({
  template: template,
  classNameBindings:["stateClass"],
  stateClass: function(){
     var github_state = this.get("issue.state");
     if(github_state === "closed"){
       return "hb-state-" + "closed";
     }
     var custom_state = this.get("issue.customState");
     if(custom_state){
       return "hb-state-" + custom_state;
     }
     return "hb-state-open";
  }.property("issue.current_state", "issue.customState", "issue.state"),
  didInsertElement: function () {
    this._super();
    this.$("a, .clickable").on("click.hbcard", function (ev){ ev.stopPropagation(); } );
  },
  willDestroyElement : function () {
    this.$("a, .clickable").off("click.hbcard");
    return this._super();
  },
  actions: {
    close: function(issue){
      this.get("ctrl").send("close", issue);
    },
    archive: function(issue){
      this.get("ctrl").send("archive", issue);
    }
  }
});

export default HbCardComponent;
