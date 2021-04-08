import test from 'ava';
import { currency } from './currency';

test('should works', t => {
    t.is(currency('10.1'), '10,10');
    t.is(currency('not_a_number'), '0,00');
});
