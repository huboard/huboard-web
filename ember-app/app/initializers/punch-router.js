import Ember from 'ember';

function addQueryParamsObservers(controller, propNames) {
  propNames.forEach(function(prop) {
    controller.addObserver(prop + '.[]', controller, controller._qpChanged);
  });
}

let get = Ember.get;

export function initialize(){
  Ember.Route.reopen({
    setup(context) {
      var controller;

      var controllerName = this.controllerName || this.routeName;
      var definedController = this.controllerFor(controllerName, true);

      if (!definedController) {
        controller =  this.generateController(controllerName, context);
      } else {
        controller = definedController;
      }


      // Assign the route's controller so that it can more easily be
      // referenced in action handlers. Side effects. Side effects everywhere.
      if (!this.controller) {
        var propNames = get(this, '_qp.propertyNames');
        addQueryParamsObservers(controller, propNames);
        this.controller = controller;
      }

      let queryParams = get(this, '_qp');

      let states = queryParams.states;

      controller._qpDelegate = states.allowOverrides;

      return this._super(...arguments);
    }
  });
}

export default {
  name: 'punch-router',
  initialize: Ember.K //initialize
};

