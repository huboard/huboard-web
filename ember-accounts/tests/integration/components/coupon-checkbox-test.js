import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('coupon-checkbox', 'Integration | Component | coupon checkbox', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });" + EOL + EOL +

  this.render(hbs`{{coupon-checkbox}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:" + EOL +
  this.render(hbs`
    {{#coupon-checkbox}}
      template block text
    {{/coupon-checkbox}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
