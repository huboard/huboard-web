import Ember from 'ember';
import ajax from 'ic-ajax';
import correlationId from 'app/utilities/correlation-id';

var HuBoardModel = Ember.Object.extend(Ember._ProxyMixin,{
  correlationId: correlationId,
  _onInit: function(){
    this.set('content', this.get('data'));
  }.on('init'),
  ajax: ajax
});

export default HuBoardModel;
