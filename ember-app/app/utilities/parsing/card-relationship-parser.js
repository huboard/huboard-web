import Ember from 'ember';
import BaseParser from './base-parser';

import IssueReferences from './rules/issue-references';

var CardRelationshipParser = Ember.Object.create({
  rules: [
    IssueReferences
  ]
});

export default new BaseParser(CardRelationshipParser);
