import ajax from 'ic-ajax';

export default function(backend){

  const faye = new Faye.Client(backend);

  faye.addExtension({
    outgoing(message, callback) {
      if (message.channel === "/meta/subscribe") {
        const channel = message.subscription.replace(/!/g,".");

        ajax(`/api${channel}/subscriptions`, {global: false})
        .then(function(subscription){
          if(subscription.error) {
            message.ext = {
              private_pub_timestamp: "",
              private_pub_signature: ""
            };
            callback(message);
          } else {
            message.ext = {
              private_pub_timestamp: subscription.timestamp,
              private_pub_signature: subscription.signature
            };
            callback(message);
          }
        }, function(){
          message.ext = {
            private_pub_timestamp: "",
            private_pub_signature: ""
          };
          callback(message);
        });
      } else {
        callback(message);
      }
    }
  });
  return faye;
}
