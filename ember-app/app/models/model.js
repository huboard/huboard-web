import Ember from 'ember';
import ajax from 'ic-ajax';
import correlationId from 'app/utilities/correlation-id';
import Serializable from 'app/mixins/serializable';

var HuBoardModel = Ember.Object.extend(
  Ember._ProxyMixin, Serializable, {
  correlationId: correlationId,
  _onInit: function(){
    this.set('content', this.get('data'));
  }.on('init'),
  ajax: ajax
});

export default HuBoardModel;
