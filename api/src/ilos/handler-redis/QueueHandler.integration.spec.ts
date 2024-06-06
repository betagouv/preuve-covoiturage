import anyTest, { TestFn } from 'ava';
import { RedisConnection } from '@/ilos/connection-redis/index.ts';
import { QueueHandler } from './QueueHandler.ts';
import { queueHandlerFactory } from './helpers/queueHandlerFactory.ts';
import { ContextType } from '@/ilos/common/index.ts';

interface Context {
  handler: QueueHandler;
  context: ContextType;
}

const test = anyTest as TestFn<Context>;

test.beforeEach(async (t) => {
  t.context.context = {
    channel: {
      service: '',
    },
  };

  const connection = new RedisConnection(process.env.APP_REDIS_URL ?? 'redis://127.0.0.1:6379');

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
