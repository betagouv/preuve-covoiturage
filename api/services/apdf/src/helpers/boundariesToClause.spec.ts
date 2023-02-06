import test from 'ava';
import { boundariesToClause } from './boundariesToClause.helper';

test('Regular boundary', (t) => {
  t.is(boundariesToClause({ start: 1, end: 2 }), ' and distance >= 1 and distance < 2');
});

test('Start only', (t) => {
  t.is(boundariesToClause({ start: 1, end: -1 }), ' and distance >= 1');
});

test('End only', (t) => {
  t.is(boundariesToClause({ start: -1, end: 2 }), ' and distance < 2');
});

test('No boundaries', (t) => {
  t.is(boundariesToClause({ start: -1, end: -1 }), '');
});
