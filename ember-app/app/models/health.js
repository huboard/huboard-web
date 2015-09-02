import Settings from 'app/models/settings';
import ajax from 'ic-ajax';
import Ember from 'ember';
var get = Ember.get;


var Health = Settings.extend({
  repo: {},
  storageKey: Ember.computed('repo.full_name',{
    get:function(){
      return this.get('repo.full_name') + "+health";
    }
  }),
  isLoaded() {
    return this.getToday() === this.get('lastLoaded');
  },
  getToday() {
    var date = new Date(),
     day = date.getUTCDay(),
     month = date.getUTCMonth(),
     year = date.getUTCFullYear();

     return `${day}-${month}-${year}`;
  },
  setLoaded() {
    this.set('lastLoaded', this.getToday());
  }
});

Health.reopenClass({
  fetch: function(repo){
    var self = this,
    health = Health.create({
      repo: repo
    });
    if(health.isLoaded()){
      return new Ember.RSVP.Promise((resolve) => resolve(health));
    }
    return ajax(`/api/${get(repo, 'full_name')}/health/board`).then(function(result){
      health.set('checks', result.data);
      health.setLoaded();
      return health;
    });
  }
});

export default Health;

