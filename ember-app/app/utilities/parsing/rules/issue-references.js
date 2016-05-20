import Ember from 'ember';

export default {
  name: 'issue-references',
  condition: function(input){
    var matches = Ember.$(input).find('a.js-issue-link').toArray();
    return matches.map((match)=> {
      return Ember.$(match).text();
    });
  }
}
