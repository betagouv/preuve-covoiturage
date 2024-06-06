import { anyTest as test } from '@/dev_deps.ts';

import { rnaCustomFormat } from './rnaCustomFormat.ts';

test('valid RNA', (t) => {
  const rna = 'W802005251';
  t.true((rnaCustomFormat as any)(rna));
});

test('too short', (t) => {
  const rna = 'W12345';
  t.false((rnaCustomFormat as any)(rna));
});

test('too long', (t) => {
  const rna = 'W00331234567890';
  t.false((rnaCustomFormat as any)(rna));
});
