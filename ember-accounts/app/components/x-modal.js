import Ember from 'ember';
import animateModalOpen from 'ember-accounts/utils/animate-modal-open';
import animateModalClose from 'ember-accounts/utils/animate-modal-close';

export default Ember.Component.extend({
  action: 'closeModal',
  setupModal: function() {
    animateModalOpen();
    Ember.$('body').on('keyup.modal', function(event) {
      if (event.keyCode === 27) {
        this.sendAction("action");
      }
    }.bind(this));

    this.$(".fullscreen-body").on('click.modal', function(event) {
      event.stopPropagation();
    }.bind(this));

    this.$(".fullscreen-overlay, .close").on('click.modal', function(){
      this.sendAction("action");
    }.bind(this));

    this.$(':input:not(.close)').first().focus();
  }.on("didInsertElement"),
  destroyModal: function() {
    Ember.$('body').off('keyup.modal');
    this.$(".fullscreen-overlay,.fullscreen-body").off("click.modal");
    animateModalClose();
  }.on("willDestroyElement")
});
