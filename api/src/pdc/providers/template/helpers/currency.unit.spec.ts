import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { currency } from './currency.ts';

it('should work', (t) => {
  assertEquals(currency('10.1'), '10,10');
  assertEquals(currency('not_a_number'), '0,00');
});
