import { anyTest as test } from '@/dev_deps.ts';
import { currency } from './currency.ts';

test('should work', (t) => {
  t.is(currency('10.1'), '10,10');
  t.is(currency('not_a_number'), '0,00');
});
