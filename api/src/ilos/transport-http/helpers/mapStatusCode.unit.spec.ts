import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { mapStatusCode } from './mapStatusCode.ts';

it('RPC/HTTP status codes mapping: regular -> 200', (t) => {
  assertEquals(
    mapStatusCode({
      id: 1,
      jsonrpc: '2.0',
      result: {},
    }),
    200,
  );
});

it('RPC/HTTP status codes mapping: notification -> 204', (t) => {
  assertEquals(mapStatusCode(), 204);
});

it('RPC/HTTP status codes mapping: Parse error -> 422', (t) => {
  assertEquals(
    mapStatusCode({
      id: 1,
      jsonrpc: '2.0',
      error: { code: -32700, message: 'Parse error' },
    }),
    422,
  );
});

it('RPC/HTTP status codes mapping: Invalid Request -> 400', (t) => {
  assertEquals(
    mapStatusCode({
      id: 1,
      jsonrpc: '2.0',
      error: { code: -32600, message: 'Invalid Request' },
    }),
    400,
  );
});

it('RPC/HTTP status codes mapping: Invalid Params -> 400', (t) => {
  assertEquals(
    mapStatusCode({
      id: 1,
      jsonrpc: '2.0',
      error: { code: -32602, message: 'Invalid Params' },
    }),
    400,
  );
});

it('RPC/HTTP status codes mapping: Method not found -> 405', (t) => {
  assertEquals(
    mapStatusCode({
      id: 1,
      jsonrpc: '2.0',
      error: { code: -32601, message: 'Method not found' },
    }),
    405,
  );
});

it('RPC/HTTP status codes mapping: Internal error -> 500', (t) => {
  assertEquals(
    mapStatusCode({
      id: 1,
      jsonrpc: '2.0',
      error: { code: -32603, message: 'Internal error' },
    }),
    500,
  );
});

it('RPC/HTTP status codes mapping: Server error 32000 -> 500', (t) => {
  assertEquals(
    mapStatusCode({
      id: 1,
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Server error' },
    }),
    500,
  );
});

it('RPC/HTTP status codes mapping: Server error 32099 -> 500', (t) => {
  assertEquals(
    mapStatusCode({
      id: 1,
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Server error' },
    }),
    500,
  );
});

it('RPC/HTTP status codes mapping: Unauthorized -> 401', (t) => {
  assertEquals(
    mapStatusCode({
      id: 1,
      jsonrpc: '2.0',
      error: { code: -32501, message: 'Unauthorized' },
    }),
    401,
  );
});

it('RPC/HTTP status codes mapping: Forbidden -> 403', (t) => {
  assertEquals(
    mapStatusCode({
      id: 1,
      jsonrpc: '2.0',
      error: { code: -32503, message: 'Forbidden' },
    }),
    403,
  );
});

it('RPC/HTTP status codes mapping: Conflict -> 409', (t) => {
  assertEquals(
    mapStatusCode({
      id: 1,
      jsonrpc: '2.0',
      error: { code: -32509, message: 'Conflict' },
    }),
    409,
  );
});

it('RPC/HTTP status codes mapping: handles array response', (t) => {
  assertEquals(
    mapStatusCode([{ id: 1, error: { data: 'email conflict', code: -32509, message: 'Conflict' }, jsonrpc: '2.0' }]),
    409,
  );
});
