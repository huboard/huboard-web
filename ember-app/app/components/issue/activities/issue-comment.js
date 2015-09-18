import KeyPressHandlingMixin from 'app/mixins/key-press-handling';
import BufferedMixin from 'app/mixins/buffered';
import Ember from 'ember';
import IssueActivity from 'app/components/issue/activities/issue-activity';


var IssueCommentComponent = IssueActivity.extend(BufferedMixin, KeyPressHandlingMixin, {
  layoutName: "issue/comment",
  classNames: ["card-comment"],
  content: Ember.computed.alias('model'),
  disabled: function(){
    return this.get('isEmpty');
  }.property('isEmpty'),
  isEmpty: function(){
    return Ember.isBlank(this.get('bufferedContent.body'));
  }.property('bufferedContent.body'),
  canEdit: function(){
    return this.get("isLoggedIn") &&
      ( this.get("isCollaborator") || (this.get("currentUser.id") === this.get("model.user.id")) );

  }.property('{isCollaborator,isLoggedIn,currentUser}'),
  registerKeydownEvents: function(){
    var self = this;

    this.$().keydown(function(e){
      self.metaEnterHandler(e, function(enabled){
        if (enabled){ self.send("save"); }
      });
    });
  }.on("didInsertElement"),
  tearDownEvents: function(){
    this.$().off("keydown");
  }.on("willDestroyElement"),
  actions: {
    taskChanged: function(body){
      this.set('bufferedContent.body', body);
      this.send('save');
    },
    edit: function(){
      this.set("isEditing", true);
    },
    save: function() {
      if(this.get('isEmpty')){ return }

      var controller = this;
      controller.set("disabled", true);
      this.get('bufferedContent').applyBufferedChanges();

      if(this._last) { this._last.abort(); }
      var comment = this.get("model");
      this._last = this.get("issue.repo").updateComment(comment)
      .then(()=> {
        if(controller.isDestroyed || controller.isDestroying){
          return;
        }
        controller.set("disabled", false);
        controller.set("isEditing", false);
        controller._last = null;
      });
    },

    cancel: function() {
      this.get('bufferedContent').discardBufferedChanges();
      this.set("isEditing", false);
    }
  }
});

export default IssueCommentComponent;
