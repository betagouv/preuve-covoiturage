import test from 'ava';

import { env, cast } from './env';
import { EnvNotFoundException } from '../exceptions';

test.before(() => {
  process.env['TEST_HELLO'] = 'world';
  process.env['TEST_HEXA'] = '51b67e98a';
});

test.after(() => {
  delete process.env['TEST_HELLO'];
});

test('env(): works with existing value', (t) => {
  t.is(env('TEST_HELLO'), 'world');
});

test('env(): works with missing value and fallback', (t) => {
  t.is(env('TEST_MISSING', 'world'), 'world');
});

test('env(): throws with missing value and no fallback', (t) => {
  t.throws(() => env('TEST_MISSING'), { instanceOf: EnvNotFoundException }, "Env key 'TEST_MISSING' not found");
});

test('env(): works with missing value and number fallback', (t) => {
  t.is(env('TEST_MISSING', 1234), 1234);
});

test('env(): works with missing value and boolean fallback', (t) => {
  t.is(env('TEST_MISSING', false), false);
});

test('env(): recognise hexa string as string', (t) => {
  t.is(typeof env('TEST_HEXA'), 'string');
  t.is(env('TEST_HEXA'), '51b67e98a');
});

test('cast(): cast to boolean', (t) => {
  t.is(cast('true'), true);
  t.is(cast('false'), false);
  t.is(cast('TRUE'), true);
  t.is(cast('FALSE'), false);
  t.not(cast('1'), true);
  t.not(cast('0'), false);
});

test('cast(): cast to number', (t) => {
  t.is(cast('1'), 1);
  t.is(cast('100'), 100);
  t.is(cast('001'), 1);
  t.is(cast('1.1234'), 1.1234);
  t.not(cast('0x10'), 10); // unsupported
  t.not(cast('100,101.434'), 100101.434); // unsupported
});
