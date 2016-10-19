import Ember from 'ember';
import BuffedMixin from 'huboard-app/mixins/buffered';
import KeyPressHandlingMixin from 'huboard-app/mixins/key-press-handling';

var IssueBodyComponent = Ember.Component.extend(BuffedMixin, KeyPressHandlingMixin,{
  classNames: ["fullscreen-card-description","card-comment"],
  registerKeydownEvents: function(){
    var self = this;
    var ctrl = self.get("controller");

    this.$().keydown(function(e){
      self.metaEnterHandler(e, function(enabled){
        if (enabled){ ctrl.send("save"); }
      });
    });
  }.on("didInsertElement"),
  tearDownEvents: function(){
    this.$().off("keydown");
  }.on("willDestroyElement"),
  isCollaboratorBinding: "model.repo.isCollaborator",
  isLoggedInBinding: "App.loggedIn",
  currentUserBinding: "App.currentUser",
  isEditing: false,
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
  actions: {
    taskChanged: function(body) {
      this.set('bufferedContent.body', body);
      this.send('save');
    },
    edit: function(){
      Ember.run(function(){
        this.set("isEditing", true); 
      }.bind(this));
    },
    save: function() {
      if(this.get('isEmpty')){ return; }
      if(this._last){this._last.abort();}

      var controller = this;
      controller.set("disabled", true);
      this.get('bufferedContent').applyBufferedChanges();

      this._last = this.get("model").update();
      this._last.then((response)=> {
        if(controller.isDestroyed || controller.isDestroying){
          return;
        }

        controller._last = null;
        controller.set("disabled", false);
        controller.set("isEditing", false);
        controller.set("model.title", response.title);
        controller.set("model.body_html", response.body_html);
      });
    },

    cancel: function() {
      this.get('bufferedContent').discardBufferedChanges();
      this.set("isEditing", false);
    }
  }
});


export default IssueBodyComponent;
