import Ember from 'ember';

var HbAvatarTooltipComponent = Ember.Component.extend({
  classNames: ['hb-avatar-tooltip'],
  classNameBindings: ['multi:multi:single'],
  setZIndex: function(){
    Ember.run.schedule('afterRender', this, ()=> {
      if(this.get('index') || this.get('index') === 0){
        this.$().css('z-index', `${100 - this.get('index')}`);
      }
    });
  }.on('didInsertElement')
});

export default HbAvatarTooltipComponent;
