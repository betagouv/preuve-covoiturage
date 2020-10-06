// tslint:disable no-invalid-this
import anyTest, { TestInterface } from 'ava';
import sinon from 'sinon';
import { RedisConnection } from '@ilos/connection-redis';
import { QueueHandler } from './QueueHandler';
import { queueHandlerFactory } from './helpers/queueHandlerFactory';
import { ContextType } from '@ilos/common';

interface Context {
  sandbox: sinon.SinonSandbox;
  handler: QueueHandler;
  context: ContextType;
}

const test = anyTest as TestInterface<Context>;

test.beforeEach(async (t) => {
  t.context.sandbox = sinon.createSandbox();
  t.context.context = {
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

  t.context.handler = new (queueHandlerFactory('basic', '0.0.1'))(fakeConnection);
  // @ts-ignore
  t.context.sandbox.stub(t.context.handler, 'getQueue').callsFake(
    // @ts-ignore
    () => ({
      // @ts-ignore
      async add(name, data) {
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

  await t.context.handler.init();
});

test.afterEach((t) => {
  t.context.sandbox.restore();
});

test.serial('Queue handler: works', async (t) => {
  const queueProvider = t.context.handler;
  const defaultContext = t.context.context;
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
  const queueProvider = t.context.handler;
  const defaultContext = t.context.context;
  const err = await t.throwsAsync(async () =>
    queueProvider.call({
      method: 'nope',
      params: { add: [1, 2] },
      context: defaultContext,
    }),
  );

  t.is(err.message, 'An error occured');
});
