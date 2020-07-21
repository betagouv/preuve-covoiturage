// tslint:disable: prefer-type-cast
import test from 'ava';
import { mapStatusCode } from './mapStatusCode';

test('RPC/HTTP status codes mapping: regular -> 200', (t) => {
  t.is(
    mapStatusCode({
      id: 1,
      jsonrpc: '2.0',
      result: {},
    }),
    200,
  );
});

test('RPC/HTTP status codes mapping: notification -> 204', (t) => {
  t.is(mapStatusCode(), 204);
});

test('RPC/HTTP status codes mapping: Parse error -> 422', (t) => {
  t.is(
    mapStatusCode({
      id: 1,
      jsonrpc: '2.0',
      error: { code: -32700, message: 'Parse error' },
    }),
    422,
  );
});

test('RPC/HTTP status codes mapping: Invalid Request -> 400', (t) => {
  t.is(
    mapStatusCode({
      id: 1,
      jsonrpc: '2.0',
      error: { code: -32600, message: 'Invalid Request' },
    }),
    400,
  );
});

test('RPC/HTTP status codes mapping: Invalid Params -> 400', (t) => {
  t.is(
    mapStatusCode({
      id: 1,
      jsonrpc: '2.0',
      error: { code: -32602, message: 'Invalid Params' },
    }),
    400,
  );
});

test('RPC/HTTP status codes mapping: Method not found -> 405', (t) => {
  t.is(
    mapStatusCode({
      id: 1,
      jsonrpc: '2.0',
      error: { code: -32601, message: 'Method not found' },
    }),
    405,
  );
});

test('RPC/HTTP status codes mapping: Internal error -> 500', (t) => {
  t.is(
    mapStatusCode({
      id: 1,
      jsonrpc: '2.0',
      error: { code: -32603, message: 'Internal error' },
    }),
    500,
  );
});

test('RPC/HTTP status codes mapping: Server error 32000 -> 500', (t) => {
  t.is(
    mapStatusCode({
      id: 1,
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Server error' },
    }),
    500,
  );
});

test('RPC/HTTP status codes mapping: Server error 32099 -> 500', (t) => {
  t.is(
    mapStatusCode({
      id: 1,
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Server error' },
    }),
    500,
  );
});

test('RPC/HTTP status codes mapping: Unauthorized -> 401', (t) => {
  t.is(
    mapStatusCode({
      id: 1,
      jsonrpc: '2.0',
      error: { code: -32501, message: 'Unauthorized' },
    }),
    401,
  );
});

test('RPC/HTTP status codes mapping: Forbidden -> 403', (t) => {
  t.is(
    mapStatusCode({
      id: 1,
      jsonrpc: '2.0',
      error: { code: -32503, message: 'Forbidden' },
    }),
    403,
  );
});

test('RPC/HTTP status codes mapping: Conflict -> 409', (t) => {
  t.is(
    mapStatusCode({
      id: 1,
      jsonrpc: '2.0',
      error: { code: -32509, message: 'Conflict' },
    }),
    409,
  );
});

test('RPC/HTTP status codes mapping: handles array response', (t) => {
  t.is(
    mapStatusCode([{ id: 1, error: { data: 'email conflict', code: -32509, message: 'Conflict' }, jsonrpc: '2.0' }]),
    409,
  );
});
