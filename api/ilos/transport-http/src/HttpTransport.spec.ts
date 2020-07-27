import anyTest, { TestInterface } from 'ava';
import supertest from 'supertest';
import { Kernel } from '@ilos/core';
import { RPCCallType, RPCResponseType } from '@ilos/common';

import { HttpTransport } from './HttpTransport';

interface Context {
  request: supertest.SuperTest<supertest.Test>;
  httpTransport: HttpTransport;
}

const test = anyTest as TestInterface<Context>;

test.before(async (t) => {
  class BasicKernel extends Kernel {
    async handle(call: RPCCallType): Promise<RPCResponseType> {
      // generate errors from method name
      if ('method' in call) {
        switch (call.method) {
          case 'test':
            // notifications return void
            if (call.id === undefined || call.id === null) {
              return;
            }

            return {
              id: 1,
              jsonrpc: '2.0',
              result: 'hello world',
            };
          case 'error':
            return {
              id: 1,
              jsonrpc: '2.0',
              error: {
                code: -32000,
                message: 'Server error',
              },
            };
          case 'invalidRequest':
            return {
              id: 1,
              jsonrpc: '2.0',
              error: {
                code: -32600,
                message: 'Server error',
              },
            };
        }
      }

      return {
        id: 1,
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: 'Method not found',
        },
      };
    }
  }

  const kernel = new BasicKernel();

  t.context.httpTransport = new HttpTransport(kernel);

  await t.context.httpTransport.up();

  t.context.request = supertest(t.context.httpTransport.getInstance());
});

test.after(async (t) => {
  await t.context.httpTransport.down();
});

test('Http transport: returns JSON-RPC compliant success response', async (t) => {
  const response = await t.context.request
    .post('/')
    .send({
      id: 1,
      jsonrpc: '2.0',
      method: 'test',
    })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');

  t.is(response.status, 200);
  t.deepEqual(response.body, {
    id: 1,
    jsonrpc: '2.0',
    result: 'hello world',
  });
});

test('Http transport: returns JSON-RPC compliant error response', async (t) => {
  const response = await t.context.request
    .post('/')
    .send({
      id: 1,
      jsonrpc: '2.0',
      method: 'returnAnError',
    })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');

  t.is(response.status, 405);
  t.deepEqual(response.body, {
    id: 1,
    jsonrpc: '2.0',
    error: {
      code: -32601,
      message: 'Method not found',
    },
  });
});

test('Http transport: regular request', async (t) => {
  const response = await t.context.request
    .post('/')
    .send({
      id: 1,
      jsonrpc: '2.0',
      method: 'test',
    })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');
  t.is(response.status, 200);
  t.is(response.body.id, 1);
  t.is(response.body.jsonrpc, '2.0');
  t.is(response.body.result, 'hello world');
});

test('Http transport: notification request', async (t) => {
  const response = await t.context.request
    .post('/')
    .send({
      jsonrpc: '2.0',
      method: 'test',
    })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');
  t.is(response.status, 204);
  t.is(response.body, '');
});

test('Http transport: should fail if missing Accept header', async (t) => {
  const response = await t.context.request
    .post('/')
    .send({
      id: 1,
      jsonrpc: '2.0',
      method: 'test',
    })
    .set('Content-Type', 'application/json');
  t.is(response.status, 415);
  t.is(response.body.id, 1);
  t.is(response.body.jsonrpc, '2.0');
  t.deepEqual(response.body.error, {
    code: -32000,
    message: 'Wrong Content-type header. Requires application/json',
  });
});

// Content-type is infered from Accept header
test('Http transport: should work without Content-type header', async (t) => {
  const response = await t.context.request
    .post('/')
    .send({
      id: 1,
      jsonrpc: '2.0',
      method: 'test',
    })
    .set('Accept', 'application/json');
  t.is(response.status, 200);
  t.is(response.body.id, 1);
  t.is(response.body.jsonrpc, '2.0');
  t.is(response.body.result, 'hello world');
});

test('Http transport: should fail if http verb is not POST', async (t) => {
  const response = await t.context.request
    .get('/')
    .send({
      id: 1,
      jsonrpc: '2.0',
      method: 'test',
    })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');
  t.is(response.status, 405);
  t.is(response.body.id, 1);
  t.is(response.body.jsonrpc, '2.0');
  t.deepEqual(response.body.error, {
    code: -32601,
    message: 'Method not allowed',
  });
});

test('Http transport: should fail if json is misformed', async (t) => {
  const response = await t.context.request
    .post('/')
    .send('{ "id": 1, jsonrpc: "2.0", "method": "test"}')
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');
  t.is(response.status, 415);
  t.is(response.body.id, 1);
  t.is(response.body.jsonrpc, '2.0');
  t.deepEqual(response.body.error, {
    code: -32000,
    message: 'Wrong content length',
  });
});

test('Http transport: should fail if service reject', async (t) => {
  const response = await t.context.request
    .post('/')
    .send({
      id: 1,
      jsonrpc: '2.0',
      method: 'error',
    })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');
  t.is(response.status, 500);
  t.is(response.body.id, 1);
  t.is(response.body.jsonrpc, '2.0');
  t.deepEqual(response.body.error, {
    code: -32000,
    message: 'Server error',
  });
});

test('Http transport: should fail if request is invalid', async (t) => {
  const response = await t.context.request
    .post('/')
    .send({
      id: 1,
      jsonrpc: '2.0',
      method: 'invalidRequest',
    })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');
  t.is(response.status, 400);
  t.is(response.body.id, 1);
  t.is(response.body.jsonrpc, '2.0');
  t.deepEqual(response.body.error, {
    code: -32600,
    message: 'Server error',
  });
});

test('Http transport: should fail if method is not found', async (t) => {
  const response = await t.context.request
    .post('/')
    .send({
      id: 1,
      jsonrpc: '2.0',
      method: 'nonExistingMethod',
    })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');
  t.is(response.status, 405);
  t.is(response.body.id, 1);
  t.is(response.body.jsonrpc, '2.0');
  t.deepEqual(response.body.error, {
    code: -32601,
    message: 'Method not found',
  });
});
