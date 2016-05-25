import {
  moduleFor,
  test
} from 'ember-qunit';

var sut;
moduleFor('model:new/issue', {
  setup: function(){
    sut = this.subject();
  }
});

test('issueReferences', (assert)=>{
  var relationships = {
    'issue-references': [
      {
        url: 'www.anissue.com',
        id: 12345678,
        text: '#123'
      }
    ]
  };
  sut.set('cardRelationships', relationships);

  var references = sut.get('issueReferences');
  assert.equal(references[0].text, '#123');
});
