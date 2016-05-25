import Ember from 'ember';

export default {
  name: 'issue-references',
  condition: function(input){
    var matches = Ember.$(input).find('a.js-issue-link').toArray();
    return matches.map((match)=> {
      var $match = Ember.$(match);
      return {
        url: $match.attr('href'),
        id: +$match.attr('data-id'),
        text: $match.text()
      };
    }).filter((reference)=> {
      return !reference.text.match(/\(comment\)/);
    });
  }
};
