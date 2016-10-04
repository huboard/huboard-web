import Ember from 'ember';
import correlationId from 'huboard-app/utilities/correlation-id';
import faye from 'huboard-app/utilities/messaging/fayeClient';

export function initialize(container, application){
  let socket = Ember.Object.extend({
    correlationId : correlationId,
    sockets: {},
    publish: Ember.K,
    subscribe: Ember.K,
    unsubscribe: Ember.K,
    subscribeTo: Ember.K
  });

  if(application.get("socketBackend") &&  window.Faye){
    socket = Ember.Object.extend({
      correlationId : correlationId,
      sockets: {},
      client: faye(application.get("socketBackend")), 
      publish: function(message){
        const channel = this._sanitizeChannel(message.meta.channel);
        var _self = this;

        if(_self._messages){
          _self._messages.push({channel: channel, message: message});
        }              
        if(_self._nextProcess){ Ember.run.cancel(_self._nextProcess); }
        _self._nextProcess = Ember.run.later(_self, _self._processMessageQueue, 50);
      },
      subscribe: function (channel, callback) {
        if(channel === "null") { return Ember.K; }
        /* jshint ignore:start */
        // == null catchs null or undefined
        if(channel == null) { return Ember.K; }
        /* jshint ignore:end */

        channel = this._sanitizeChannel(channel);

        if(!this.get("sockets")[channel]){
          this.subscribeTo(channel);
        }
        this.get("sockets")[channel].callbacks.add(callback);
        return callback;
      },
      unsubscribe: function(channel, callback) {
        if(channel === "null") { return Ember.K; }
        if(channel == null) { return Ember.K; }

        channel = this._sanitizeChannel(channel);
        this.get("sockets")[channel].callbacks.remove(callback);
      },
      _processMessageQueue: function() {
        const maxPerRun = 1, delay = 50, self = this;
        let processed = 0;
        if(this._messages){
          var callback = ()=> {self.get("sockets")[message.channel].callbacks.fire(message.message);};
          while(processed < maxPerRun && this._messages.length>0){
            var message = this._messages.shift();
            if(message){
              Ember.run.schedule('afterRender', this, callback);
              processed++;
            }
          }

          if(this._messages.length === 0){
            //queue is empty
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
      _sanitizeChannel: function(channel) {
        return channel.replace(/\./g, '!').toLowerCase();
      },
      subscribeTo: function(channel) {
        var channel = this._sanitizeChannel(channel), self = this;
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
export default {
  name: 'sockets',
  initialize: initialize
};
