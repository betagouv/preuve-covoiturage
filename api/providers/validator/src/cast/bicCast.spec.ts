import test from 'ava';

import { bicCast } from './bicCast';

test('cast proper BIC', (t) => t.is(bicCast({ data: 'ABNANL2A' }), 'ABNANL2A'));
test('remove spaces', (t) => t.is(bicCast({ data: 'ned sza jj xxx' }), 'NEDSZAJJXXX'));
test('remove dashes', (t) => t.is(bicCast({ data: 'ned-sza-jj-xxx' }), 'NEDSZAJJXXX'));
test('cast to uppercase', (t) => t.is(bicCast({ data: 'nedszajjxxx' }), 'NEDSZAJJXXX'));

test('fails on empty', (t) => {
  t.throws(() => bicCast({ data: '' }), { message: 'Invalid BIC' });
});
test('fails on null', (t) => {
  t.throws(() => bicCast({ data: null }), { message: 'Invalid BIC' });
});
test('fails on undefined', (t) => {
  t.throws(() => bicCast({ data: undefined }), { message: 'Invalid BIC' });
});
