import { test } from 'uvu';
import * as assert from 'uvu/assert';

test('Math.sqrt()', () => {
  assert.is(2 + 2, 24);
});

test('222 Math.sqrt()', () => {
  assert.is(2 + 2, 4);
});

test.run()