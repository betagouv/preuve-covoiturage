// tslint:disable no-invalid-this
import anyTest, { TestInterface } from 'ava';
import sinon from 'sinon';
import { RedisConnection } from '@ilos/connection-redis';

import * as Bull from './helpers/bullFactory';
import { queueHandlerFactory } from './helpers/queueHandlerFactory';

interface Context {
  sandbox: sinon.SinonSandbox;
}

const test = anyTest as TestInterface<Context>;

test.beforeEach(async (t) => {
  t.context.sandbox = sinon.createSandbox();
  t.context.sandbox.stub(Bull, 'bullFactory').callsFake(
    // @ts-ignore
    () => ({
      // @ts-ignore
      async add(data) {
        if (!!data.method && data.method !== 'nope') {
          return data;
        }
        throw new Error('Nope');
      },
      async isReady() {
        return this;
      },
    }),
  );
});

test.afterEach((t) => {
  t.context.sandbox.restore();
});

function setup() {
  const defaultContext = {
    channel: {
      service: '',
    },
  };

  class FakeRedis extends RedisConnection {
    getClient() {
      return null;
    }
  }

  const fakeConnection = new FakeRedis({});
  return {
    defaultContext,
    fakeConnection,
  };
}

test.serial('Queue handler: works', async (t) => {
  const { fakeConnection, defaultContext } = setup();
  const queueProvider = new (queueHandlerFactory('basic', '0.0.1'))(fakeConnection);
  await queueProvider.init();
  const result = (await queueProvider.call({
    method: 'basic@latest:method',
    params: { add: [1, 2] },
    context: defaultContext,
  })) as any;

  t.deepEqual(result, {
    jsonrpc: '2.0',
    id: null,
    method: 'basic@latest:method',
    params: { params: { add: [1, 2] }, _context: defaultContext },
  });
});

test.serial('Queue handler: raise error if fail', async (t) => {
  const { fakeConnection, defaultContext } = setup();

  const queueProvider = new (queueHandlerFactory('basic', '0.0.1'))(fakeConnection);
  await queueProvider.init();
  const err = await t.throwsAsync(async () =>
    queueProvider.call({
      method: 'nope',
      params: { add: [1, 2] },
      context: defaultContext,
    }),
  );

  t.is(err.message, 'An error occured');
});
