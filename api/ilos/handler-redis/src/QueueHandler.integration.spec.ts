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

  const connection = new RedisConnection({ connectionString: process.env.APP_REDIS_URL ?? 'redis://127.0.0.1:6379' });

  t.context.handler = new (queueHandlerFactory('basic', '0.0.1'))(connection);
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
