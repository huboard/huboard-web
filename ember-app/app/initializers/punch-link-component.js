import Ember from 'ember';

export function initialize(){
  Ember.LinkComponent.reopen({
    init: function(){
      this._super.apply(this, arguments);

      this.on("click", this, this._closeDropdown);
    },
    tearDownEvent: function(){
      this.off("click");
    }.on("willDestroyElement"),
    _closeDropdown : function() {
      this.$().parents(".dropdown").removeClass("open");
    }
  });

}

export default {
  name: 'punch-link-component',
  initialize: initialize
};


