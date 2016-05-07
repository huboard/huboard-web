import { stripeMoney } from '../../../helpers/stripe-money';
import { module, test } from 'qunit';

module('Unit | Helper | stripe money');

// Replace this with your real tests.
test('it works', function(assert) {
  let result = stripeMoney(42);
  assert.ok(result);
});
