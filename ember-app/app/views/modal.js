import Ember from 'ember';
import animateModalOpen from 'app/config/animate-modal-open';
import layout from 'app/templates/layouts/modal';

var ModalView = Ember.View.extend({
  layout: layout,
  modalSize: "",
  modalCloseCriteria: function(){
    return false;
  },

  didInsertElement: function() {
    animateModalOpen();

    Ember.$('body').on('keyup.modal', function(event) {
      if (event.keyCode === 27) {
        if (this.modalCloseCriteria()) {
          this.send("modalCloseAction");
        } else {
          this.get('controller').send('closeModal');
        }
      }
    }.bind(this));
    
    this.$(".fullscreen-body").on('click.modal', function(event){
       if(!Ember.$(event.target).parents(".hb-selector-component").length) {
        this.$(".open")
          .not(Ember.$(event.target).parents(".hb-selector-component"))
          .removeClass("open");
       }
       if(Ember.$(event.target).is("[data-ember-action],[data-toggle]")){return;}
       if(Ember.$(event.target).parents("[data-ember-action],[data-toggle]").length){return;}
       event.stopPropagation();    
    }.bind(this));
     
    this.$(".fullscreen-overlay, .close").on('click.modal', function(event){
     if(Ember.$(event.target).is("[data-ember-action],[data-toggle]")){return;}
     if(Ember.$(event.target).parents("[data-ember-action],[data-toggle]").length){return;}
     this.close();
    }.bind(this));

    this.$(':input:not(.close):not([type="checkbox"])').first().focus();

    this.$('.modal-close').click(function(){
      this.close();
    }.bind(this));
  },

  close: function(){
    if(this.modalCloseCriteria()){
      this.send("modalCloseAction");
    } else {
      this.get('controller').send('closeModal');
    }
  },

  willDestroyElement: function() {
    Ember.$('body').off('keyup.modal');
    this.$(".fullscreen-overlay,.fullscreen-body").off("click.modal");
    this.$('.modal-close').off("click");
  },

  actions: {
    modalCloseAction: function(){
     var closeModal = confirm("Any unsaved work may be lost! Continue?");
     if(closeModal){ this.get('controller').send('closeModal'); }
    }
  }
});

export default ModalView;
