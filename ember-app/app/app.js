import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';
import correlationId from './utilities/correlation-id';
import Settings from 'app/models/settings';
import Global from 'app/models/global';
import ajax from 'ic-ajax';

Ember.MODEL_FACTORY_INJECTIONS = true;

Ember.LinkView.reopen({
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

Ember.onLoad("Ember.Application", function ($app) {
  $app.initializer({
    name: 'deferReadiness',
    initialize: function(container, application){
      application.deferReadiness();
    }
  });
  $app.initializer({
    name: "sockets",
    initialize : function (container, application){

      let socket = Ember.Object.extend({
        correlationId : correlationId,
        sockets: {},
        subscribe: Ember.K,
        unsubscribe: Ember.K,
        subscribeTo: Ember.K
      });

      if(application.get("socketBackend")){
        const faye = new Faye.Client(application.get('socketBackend'));
        faye.addExtension({
          outgoing(message, callback) {
            if (message.channel == "/meta/subscribe") {
              ajax(`/api${message.subscription}/subscriptions`).then(function(subscription){
                message.ext = {
                  private_pub_timestamp: subscription.timestamp,
                  private_pub_signature: subscription.signature
                }
                callback(message);
              })
            } else {
              callback(message);
            }

          }
        });

        socket = Ember.Object.extend({
          correlationId : correlationId,
          sockets: {},
          client: faye, 
          publish: function(message){
            const channel = message.meta.channel.toLowerCase();
            var _self = this;

            if(_self._messages){
              _self._messages.push({channel: channel, message: message});
            }              
            if(_self._nextProcess){ Ember.run.cancel(_self._nextProcess); }
            _self._nextProcess = Ember.run.later(_self, _self._processMessageQueue, 50);
          },
          subscribe: function (channel, callback) {
            const channel = channel.toLowerCase();
            if(!this.get("sockets")[channel]){
              this.subscribeTo(channel);
            }
            this.get("sockets")[channel].callbacks.add(callback);
            return callback;
          },
          unsubscribe: function(channel, callback) {
            const channel = channel.toLowerCase();
            this.get("sockets")[channel].callbacks.remove(callback);
          },
          _processMessageQueue() {
             const maxPerRun = 1, delay = 50, self = this;
             let processed = 0;
             if(this._messages){
               while(processed < maxPerRun && this._messages.length>0){
                 var message = this._messages.shift();
                 if(message){
                   Ember.run.schedule('afterRender', this, function(){
                      self.get("sockets")[message.channel].callbacks.fire(message.message);
                   });
                   processed++;
                 }
               }

               if(this._messages.length === 0){
                 //queue is empty
                 console.log("processed:", processed, "max:", maxPerRun);
               } else {
                 if(self._nextProcess){
                   Ember.run.cancel(self._nextProcess);
                 }
                 self._nextProcess = Ember.run.next(self, function(){
                   if(self._nextProcess){
                     Ember.run.cancel(self._nextProcess);
                   }
                   self._nextProcess = Ember.run.later(self, self._processMessageQueue, delay);
                 });
               }
             }
          },
          _messages: [],
          subscribeTo: function(channel) {
            const channel = channel.toLowerCase(), self = this;
            var client = this.get('client'), 
              callbacks = Ember.$.Callbacks();

            client.disable("eventsource");
            var source = client.subscribe("/" + channel, function(message){
              if(self._messages){
                self._messages.push({channel: channel, message: message});
              }              
              if(self._nextProcess){ Ember.run.cancel(self._nextProcess); }
              self._nextProcess = Ember.run.later(self, self._processMessageQueue, 50);
              //callbacks.fire(event);
            });
            this.get("sockets")[channel] = {
              source: source,
              callbacks: callbacks
            };
          }
        });
      } 
      application.set("Socket", socket);

      application.register('socket:main',application.Socket, {singleton: true});
      application.inject('socket:main', 'repo', 'repo:main');

      application.inject("controller","socket", "socket:main");
      application.inject("component","socket", "socket:main");
      application.inject("model", "socket", "socket:main");
      application.inject("route", "socket", "socket:main");
      application.inject("service", "socket", "socket:main");
    }
  });
  $app.initializer({
    name: "settings",
    before: "sockets",
    after: 'advanceReadiness',
    initialize: function(container, application) {
      application.register('repo:main', application.get("repo"), {instantiate: false});
      application.register('settings:main', Settings);
      application.inject('settings:main', 'repo', 'repo:main');
      application.inject('controller', 'settings', 'settings:main');
      application.inject('view', 'settings', 'settings:main');
      application.inject('component', 'settings', 'settings:main');

      application.register('global:main', Global);
      application.inject('controller', 'global', 'global:main');
      application.inject('view', 'global', 'global:main');
    }
  });
});

var HuBoard = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver: Resolver,
  rootElement: "#application",
  dimFilters: [],
  hideFilters: [],
  searchFilter: null,
  memberFilter: null,
  eventReceived: 0
});

loadInitializers(HuBoard, config.modulePrefix);

export default HuBoard;
