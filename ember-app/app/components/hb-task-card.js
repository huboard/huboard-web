import Ember from "ember";
import IssueFiltersMixin from "huboard-app/mixins/issue-filters";
import MemberDragAndDropMixin from "huboard-app/mixins/member-drag-and-drop";
import Messaging from "huboard-app/mixins/messaging";

var HbCardComponent = Ember.Component.extend(
  Messaging, IssueFiltersMixin, MemberDragAndDropMixin, {
    attributeBindings: ['style'],
    classNames: ["card"],
    classNameBindings: ["isFiltered","isDraggable:is-draggable", "isClosable:closable", "issue.linkedColor:border", "stateClass", "taskCard:task-card", "global.expandLabels:board-heavy:board-light"],
    taskCard: true,
    filters: Ember.inject.service(),
    repoName: Ember.computed.alias("issue.repoName"),
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
    presentReferences: Ember.computed.filterBy('issue.issueReferences', 'title'),
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
    hasDetails: Ember.computed('visibleAssignees.[]', 'issue.{assignee,assignees,commentCount}',{
      get() {
        return this.get('visibleAssignee.length') ||
          this.get('issue.commentCount') ||
          this.get('issue.assignee') || 
          this.get('issue.assignees');
      }
    }),
    hasAvatar: Ember.computed('issue.{assignee,assignees}', {
      get() {
        return this.get('issue.assignee') ||
          this.get('issue.assignees.length');
      }
    }),
    isFiltered: Ember.computed.alias('issue.isFiltered'),
    click: function(ev){
      if(this.get("isFiltered") === "filter-hidden" || Ember.$(ev.target).is("a.number")){
        return;
      }
      var reference = Ember.$(ev.target).parent(".hb-card-tray").find('.number').data('issue-id');
      if(reference){
        var issue = this.get("presentReferences").findBy("id", reference);
        if(issue){ return this.sendAction("cardClick", issue); }
      }
      this.sendAction("cardClick", this.get("issue"));
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
    filteredLabels: Ember.computed("filters.labelFilters.[]", "isFiltered", "cardLabels", {
      get() {
        let filters = this.get('filters.labelFilters').filter((x) => Ember.get(x, 'mode') > 0);

        return this.get('cardLabels').filter((x) => {
          return filters.isAny('name', Ember.get(x, 'name'));
        });
      }
    }),
    unfilteredLabels: Ember.computed('filteredLabels', {
      get() {
        let filtered = this.get('filteredLabels');
        return this.get('cardLabels').reject((x) => {
          return filtered.isAny('name', Ember.get(x, 'name'));
        });
      }
    }),
    visibleLabels: Ember.computed.alias('cardLabels'),
    visibleAssignees: Ember.computed('filters.memberFilters.[]', 'issue.assignee', 'issue.assignees.[]', {
      get() {
        let assignees = this.get('issue.assignees');
        if(!assignees) {
          return this.get('issue.assignee') ? [ this.get('issue.assignee') ] : [];
        }
        return assignees;
      }
    }),
    stateClass: Ember.computed.alias('issue.stateClass'),
    registerToColumn: function(){
      this.set("cards", this.get("parentView.cards"));
      this.get("cards").pushObject(this);
    }.on("didInsertElement"),
    unregisterFromColumn: function(){
      this.get("cards").removeObject(this);
    }.on("willDestroyElement"),

    actions: {
      assignUser: function(login){
        return this.get("issue").assignUsers([login]);
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
