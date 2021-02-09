import test from 'ava';

import { rnaCustomFormat } from './rnaCustomFormat';

test('valid RNA', (t) => {
  const rna = 'W802005251';
  t.true(rnaCustomFormat(rna));
});

test('too short', (t) => {
  const rna = 'W12345';
  t.false(rnaCustomFormat(rna));
});

test('too long', (t) => {
  const rna = 'W00331234567890';
  t.false(rnaCustomFormat(rna));
});
