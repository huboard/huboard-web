import Ember from 'ember';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

Ember.$.ajaxSetup({ cache: false });
Ember.MODEL_FACTORY_INJECTIONS = true;

var HuBoard = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver: Resolver,
  dimFilters: [],
  hideFilters: [],
  searchFilter: null,
  memberFilter: null,
  eventReceived: 0
});

loadInitializers(HuBoard, config.modulePrefix);

export default HuBoard;
