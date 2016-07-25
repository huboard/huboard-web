import Ember from 'ember';
import CreditCardForm from './credit-card-form';

export default CreditCardForm.extend({
  didProcessToken(status, response) {
    if (response.error) {
      this.set('processingCard', false);
      return this.set('errors', response.error.message);
    } else {
      this.set('errors', "");
      return this.postUpdate(response);
    }
  },
  postUpdate(token) {
    return this.ajax("/settings/profile/" + this.get("model.org.login") + "/card", {
      email: this.get("model.org.billing_email"),
      card: token
    }).then(this.didUpdateCard.bind(this));
  },
  didUpdateCard(response) {
    this.set('processingCard', false);
    this.set('model.card.details.card', response.card);
    return this.sendAction('close');
  },
  ajax(url, data) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let hash = {};
      hash.url = url;
      hash.type = 'PUT';
      hash.context = this;
      hash.data = data;
      hash.success = (json) => {
        return resolve(json);
      };
      hash.error = (jqXHR) => {
        return reject(jqXHR);
      };

      return Ember.$.ajax(hash);
    });
  }
});
