import Ember from "ember";
import IssueFiltersMixin from "app/mixins/issue-filters";
import MemberDragAndDropMixin from "app/mixins/member-drag-and-drop";
import CardSubscriptions from "app/mixins/subscriptions/card";
import Messaging from "app/mixins/messaging";

//Visitors
import cardLabelsVisitor from "app/visitors/cards/labels";
import cardAssigneesVisitor from "app/visitors/cards/assignees";

var HbCardComponent = Ember.Component.extend(
  Messaging, IssueFiltersMixin, MemberDragAndDropMixin, CardSubscriptions, {
    attributeBindings: ['style'],
    classNames: ["card"],
    classNameBindings: ["isFiltered","isDraggable:is-draggable", "isClosable:closable", "issue.linkedColor:border", "stateClass", "taskCard:task-card"],
    taskCard: true,
    filters: Ember.inject.service(),
    repoName: function(){
      var parent_owner = this.get('issue.repo.parent.repo.owner.login');
      var current_owner = this.get('issue.data.repo.owner.login');
      if(parent_owner === current_owner){
        return this.get('issue.data.repo.name');
      }
      return this.get('issue.data.repo.full_name');
    }.property('issue.data.repo.full_name'),
    style: Ember.computed('issue.linkedColor', {
      get: function(){
        const color = this.get("issue.linkedColor");
        if(color) {
          return Ember.String.htmlSafe(`border-left-color: #${color}`);
        } else {
          return Ember.String.htmlSafe("");
        }
      }
    }),
    isCollaborator: function(){
      return this.get("issue.repo.isCollaborator");
    }.property("issue.repo.isCollaborator"),
    isClosable: function () {
     return App.get("loggedIn") && this.get("isLast") && this.get("issue.data.state") === "open";
    }.property("loggedIn", "isLast","issue.data.state"),
    onDestroy: function (){
      if(!this.get("issue.isArchived")){ return; }
      var self = this;
      Ember.run.once(function () {
        self.$().fadeOut("fast", function () {
          var issue = self.get("issues").find(function(i) {
            return i.get("id") === self.get("issue.id");
          });
          self.get("issue.repo.issues").removeObject(issue);
        });
      });
    }.observes("issue.isArchived", "issue.customState"),
    isDraggable: function( ){
      return App.get("loggedIn") &&
        this.get("isCollaborator") &&
        this.get("isFiltered") !== "filter-hidden";
    }.property("loggedIn","issue.data.state", "isFiltered"),
    isFiltered: function(){
      var item = this.get("issue");
      if(this.isHidden(item)){return "filter-hidden";}
      if(this.isDim(item)){return "dim";}
      return "";
    }.property("filters.hideFilters", "filters.dimFilters", "issue.milestoneTitle", "issue.other_labels.[]"),
    click: function(ev){
      if(this.get("isFiltered") === "filter-hidden" || Ember.$(ev.target).is("a.xnumber")){
        return;
      }
      this.sendAction("cardClick");
    },
    issueNumber: function () {
       return this.get("issue.number");
    }.property(),
    isLast: function(){
      return this.get("isLastColumn") && this.get("isCollaborator");
    }.property("isLastColumn", "isCollaborator"),
    canArchive: function () {
      this.get("isCollaborator");
      return this.get("issue.data.state") === "closed" &&
        App.get("loggedIn") && this.get("isCollaborator");
    }.property("issue.data.state", "isCollaborator"),
    cardLabels: function () {
        return this.get("issue.data.other_labels").map(function(l){
          var color = Ember.$.Color('#' + l.color);

          var style = `background-color: ${color.toString()}; color: ${color.contrastColor()}; border-color: ${color.toString()}`;

          return Ember.Object.create(_.extend(l,{customStyle: Ember.String.htmlSafe(style)}));
        });
    }.property("issue.data.other_labels.[]"),
    applyCardLabels: function(){
      Ember.run.schedule('afterRender', this, ()=>{
        this.accept(cardLabelsVisitor);
      });
    }.observes('cardLabels.[]', 'isFiltered').on('didInsertElement'),
    applyCardAssignees: function(){
      Ember.run.schedule('afterRender', this, ()=>{
        this.accept(cardAssigneesVisitor);
      });
    }.observes('issue.assignees.[]', 'isFiltered').on('didInsertElement'),
    stateClass: function(){
       var github_state = this.get("issue.data.state");
       if(github_state === "closed"){
         return "hb-state-" + "closed";
       }
       var custom_state = this.get("issue.customState");
       if(custom_state){
         return "hb-state-" + custom_state;
       }
       return "hb-state-open";
    }.property("issue.data.current_state", "issue.customState", "issue.data.state", "issue.data.other_labels.[]"),
    isReady: Ember.computed.equal('stateClass', 'hb-state-ready'),
    isBlocked: Ember.computed.equal('stateClass', 'hb-state-blocked'),

    registerToColumn: function(){
      this.set("cards", this.get("parentView.cards"));
      this.get("cards").pushObject(this);
    }.on("didInsertElement"),
    unregisterFromColumn: function(){
      this.get("cards").removeObject(this);
    }.on("willDestroyElement"),

    actions: {
      assignUser: function(login){
        return this.get("issue").assignUser(login);
      },
      archive: function () {
        this.set("issue.customState", "archived");
      },
      close: function (){
        this.get("issue").close();
      }
    },
});

export default HbCardComponent;
