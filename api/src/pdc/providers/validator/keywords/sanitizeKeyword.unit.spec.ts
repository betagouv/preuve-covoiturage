import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { IFilterXSSOptions } from '@/deps.ts';

import { sanitizeKeyword } from './sanitizeKeyword.ts';

function macro(config: boolean | IFilterXSSOptions) {
  return function macro(t: ExecutionContext, input: any, expected: string) {
    const xss = (sanitizeKeyword as any).compile(config);

    // ctx is here to fake the context passed by AJV
    const ctx = { parentData: { foo: input }, parentDataProperty: 'foo' };
    xss(input, ctx);

    assertEquals(ctx.parentData[ctx.parentDataProperty], expected);
  };
}

// test the default config (strips all tags)
// @source https://github.com/leizongmin/js-xss/blob/master/test/test_xss.js
it('[text/plain] undefined', macro(true), undefined, '');
it('[text/plain] null', macro(true), null, '');
it('[text/plain] number', macro(true), 123, '123');
it('[text/plain] object', macro(true), { a: 1111 }, '[object Object]');

it(
  '#XSS_Filter_Evasion_Cheat_Sheet',
  macro(true),
  '></SCRIPT>">\'><SCRIPT>alert(String.fromCharCode(88,83,83))</SCRIPT>',
  '&gt;"&gt;\'&gt;',
);

// test a custom config
it(
  '[text/html] <a> tag allowed',
  macro({}),
  '<a href="https://example.com">content</a>',
  '<a href="https://example.com">content</a>',
);

it(
  '[text/html] <a> tag denied',
  macro({ whiteList: {}, stripIgnoreTag: true }),
  '<a href="https://example.com">content</a>',
  'content',
);

it(
  '[text/html] <form> tag',
  macro({}),
  '<form action="https://example.com">form content</form>',
  '&lt;form action="https://example.com"&gt;form content&lt;/form&gt;',
);
