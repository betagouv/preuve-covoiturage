import test from 'ava';

import { roughly } from './roughly';

test('0%', (t) => {
  t.true(roughly(100, 100, 0));
  t.false(roughly(100, 101, 0));
  t.false(roughly(100, 99, 0));
  t.true(roughly(-100, -100, 0));
  t.true(roughly(0, 0, 0));
  t.true(roughly(-0, 0, 0));
  t.true(roughly(0, -0, 0));
  t.true(roughly(Infinity, Infinity, 0));
  t.false(roughly(Infinity, -Infinity, 0));
});

test('default (5%)', (t) => {
  t.true(roughly(100, 100));
  t.true(roughly(100, 105));
  t.true(roughly(100, 95));
  t.false(roughly(100, 105.1));
  t.false(roughly(100, 94.9));
});

test('wrong types', (t) => {
  t.false(roughly('100' as any, '100' as any));
});
