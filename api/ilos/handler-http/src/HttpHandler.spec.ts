import test from 'ava';
import nock from 'nock';

import { httpHandlerFactory } from './helpers/httpHandlerFactory';

const defaultContext = {
  channel: {
    service: '',
  },
};

function setup(
  replyFn = function(uri, req) {
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

  const request = nock(url)
    .post('/')
    .reply(replyFn);

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

test.afterEach(() => {
  console.log('tototo');
  nock.cleanAll();
});

test.serial('Http handler: works', async (t) => {
  t.plan(3);
  const { call } = setup(function(_, req) {
    t.deepEqual(req, {
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
    t.is(this.req.headers.accept, 'application/json');
    t.is(this.req.headers['content-type'], 'application/json');
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

test.serial('throw error on status code error', async (t) => {
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

  const err = await t.throwsAsync<Error>(async () => call());
  t.is(err.message, 'An error occured');
});

test.serial('throw error on object error', async (t) => {
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

  const err = await t.throwsAsync<Error>(async () => call());
  t.is(err.message, 'wrong!');
});
