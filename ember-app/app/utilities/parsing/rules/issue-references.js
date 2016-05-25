import Ember from 'ember';

export default {
  name: 'issue-references',
  condition: function(input){
    var matches = Ember.$(input).find('a.js-issue-link').toArray();
    return matches.map((match)=> {
      return {
        url: Ember.$(match).attr('href'),
        id: new Number(Ember.$(match).attr('data-id')),
        text: Ember.$(match).text()
      };
    }).filter((reference)=> {
      return !reference.text.match(/\(comment\)/);
    });
  }
}
