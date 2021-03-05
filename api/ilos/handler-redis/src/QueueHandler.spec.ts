import anyTest, { TestInterface } from 'ava';
import { RedisConnection } from '@ilos/connection-redis';
import { QueueHandler } from './QueueHandler';
import { queueHandlerFactory } from './helpers/queueHandlerFactory';
import { ContextType } from '@ilos/common';

interface Context {
  handler: QueueHandler;
  context: ContextType;
}

const test = anyTest as TestInterface<Context>;

test.beforeEach(async (t) => {
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
  await t.context.handler.init();
});

test.serial('Queue handler: works', async (t) => {
  const queueProvider = t.context.handler;
  const defaultContext = t.context.context;
  const result = (await queueProvider.call({
    method: 'basic@latest:method',
    params: { add: [1, 2] },
    context: defaultContext,
  })) as any;

  t.deepEqual(result.data, {
    jsonrpc: '2.0',
    id: null,
    method: 'basic@latest:method',
    params: { params: { add: [1, 2] }, _context: defaultContext },
  });
});
