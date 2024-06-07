import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';

import { httpHandlerFactory } from './helpers/httpHandlerFactory.ts';

const defaultContext = {
  channel: {
    service: '',
  },
};

function setup(
  replyFn = function (uri, req) {
    return [
      200,
      {},
      {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    ];
  },
) {
  const url = 'http://myfakeservice:8080';

  const request = nock(url).post('/').reply(replyFn);

  const provider = new (httpHandlerFactory('service', url))();
  provider.init();

  return {
    request,
    call: () =>
      provider.call({
        method: 'service@latest:method',
        params: { param: true },
        context: defaultContext,
      }),
  };
}

afterEach(() => {
  nock.cleanAll();
});

it('Http handler: works', async (t) => {
  t.plan(3);
  const { call } = setup(function (_, req) {
    assertObjectMatch(req, {
      id: 1,
      jsonrpc: '2.0',
      method: 'service@latest:method',
      params: {
        _context: defaultContext,
        params: {
          param: true,
        },
      },
    });
    assertEquals(this.req.headers.accept, 'application/json');
    assertEquals(this.req.headers['content-type'], 'application/json');
    return [
      200,
      {
        jsonrpc: '2.0',
        id: 1,
        result: 'hello world',
      },
      {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    ];
  });

  await call();
});

it('throw error on status code error', async (t) => {
  const { call } = setup(() => [
    500,
    {
      jsonrpc: '2.0',
      id: 1,
      result: 'hello world',
    },
    {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  ]);

  const err = await assertThrows<Error>(async () => call());
  assertEquals(err.message, 'An error occured');
});

it('throw error on object error', async (t) => {
  const { call } = setup(() => [
    200,
    {
      jsonrpc: '2.0',
      id: 1,
      error: { message: 'wrong!' },
    },
    {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  ]);

  const err = await assertThrows<Error>(async () => call());
  assertEquals(err.message, 'wrong!');
});
