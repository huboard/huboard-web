import Ember from 'ember';
import KeyPressHandlingMixin from 'huboard-app/mixins/key-press-handling';
import BufferedMixin from 'huboard-app/mixins/buffered';

var IssueTitleComponent = Ember.Component.extend(BufferedMixin,KeyPressHandlingMixin,{
  classNames: ["fullscreen-header"],
  focusTextbox: function(){
    var input = this.$('input');
    input.focus();
    input.val(input.val());
  },
  registerKeydownEvents: function(){
    var self = this;
    var ctrl = self.get("controller");

    this.$().keydown(function(e){
      self.metaEnterHandler(e, function(enabled){
        if (enabled) { ctrl.send("save"); }
      });
      self.enterHandler(e, function(enabled){
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
  disabled: false,
  canEdit: function(){
    return this.get("isLoggedIn") &&
      ( this.get("isCollaborator") || (this.get("currentUser.id") === this.get("model.user.id")) );

  }.property('{isCollaborator,isLoggedIn,currentUser}'),
  actions: {
    edit: function(){
      Ember.run.schedule('afterRender', this, 'focusTextbox');
      this.set("isEditing", true);
    },
    save: function() {
      var controller = this;
      this.get('bufferedContent').applyBufferedChanges();
      controller.set("disabled", true);

      this.get("model").update().then((response)=> {
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

export default IssueTitleComponent;

