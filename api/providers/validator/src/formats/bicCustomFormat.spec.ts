import test from 'ava';
import { bicCustomFormat } from './bicCustomFormat';

test('valid BIC short string', (t) => {
  const bic = 'ABNANL2A';
  t.true(bicCustomFormat(bic));
});

test('valid BIC padding X', (t) => {
  const bic = 'ABNANL2AXXX';
  t.true(bicCustomFormat(bic));
});

test('invalid BIC too short', (t) => {
  const bic = '012345';
  t.false(bicCustomFormat(bic));
});

test('invalid BIC too long', (t) => {
  const bic = '00331234567890';
  t.false(bicCustomFormat(bic));
});
