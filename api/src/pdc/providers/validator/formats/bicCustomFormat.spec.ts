import test from 'ava';
import { bicCustomFormat } from './bicCustomFormat.ts';

test('valid BIC short string', (t) => {
  const bic = 'ABNANL2A';
  t.true((bicCustomFormat as any)(bic));
});

test('valid BIC padding X', (t) => {
  const bic = 'ABNANL2AXXX';
  t.true((bicCustomFormat as any)(bic));
});

test('invalid BIC too short', (t) => {
  const bic = '012345';
  t.false((bicCustomFormat as any)(bic));
});

test('invalid BIC too long', (t) => {
  const bic = '00331234567890';
  t.false((bicCustomFormat as any)(bic));
});
