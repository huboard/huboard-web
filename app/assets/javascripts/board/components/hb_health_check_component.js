var Markdown = require("../vendor/marked");

var HbHealthCheckComponent = Ember.Component.extend({
  message: null,
  messageMarkdown: function(){
    return Markdown(this.get('message'));
  }.property('message'),
  weight: null,
  tagName: 'li',
  classNames: ['health_check'],
  icon: function(){
    switch (this.get('weight')){
      case 'info':
        return 'ui-icon-list';
      case 'warning':
        return 'ui-icon-alert';
      case 'error':
        return 'ui-icon-x';
    }
  }.property('weight'),
  messageWeight: function(){
    if (this.get('weight') === 'warning'){
      return 'alert';
    }
    return 'alert alert-' + this.get('weight');
  }.property('weight')
});

module.exports = HbHealthCheckComponent;
