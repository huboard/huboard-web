import Ember from 'ember';
import animateModalOpen from 'ember-accounts/utils/animate-modal-open';
import animateModalClose from 'ember-accounts/utils/animate-modal-close';
import ModalLayout from '../templates/components/x-modal';

export default Ember.Component.extend({
  setupModal: function() {
    animateModalOpen();
    Ember.$('body').on('keyup.modal', function(event) {
      if (event.keyCode === 27) {
        //console.log("ESC CLOSE");
        this.sendAction("close");
      }
    }.bind(this));

    this.$(".fullscreen-body").on('click.modal', function(event) {
      // Had to comment this out, otherwise the events from child components
      // wouldn't properly bubble/send. 
      //console.log(event);
      event.stopPropagation();
    }.bind(this));

    this.$(".fullscreen-overlay, .close").on('click.modal', function(event){
      // Had to comment this out, otherwise the events from child components
      // wouldn't properly bubble / send.
      //console.log('sending close action');
      this.sendAction("close");
    }.bind(this));

    this.$(':input:not(.close)').first().focus();
  }.on("didInsertElement"),
  destroyModal: function() {
    Ember.$('body').off('keyup.modal');
    this.$(".fullscreen-overlay,.fullscreen-body").off("click.modal");
    animateModalClose();
  }.on("willDestroyElement")
});
