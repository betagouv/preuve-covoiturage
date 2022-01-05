import anyTest, { TestFn } from 'ava';
import { pEvent} from 'p-event';
import { RedisConnection } from './RedisConnection';

interface Context {
  connection: RedisConnection;
}

const test = anyTest as TestFn<Context>;

test.before((t) => {
  t.context = {
    connection: new RedisConnection({ connectionString: process.env.APP_REDIS_URL ?? 'redis://127.0.0.1:6379' }),
  };
});

test.after(async (t) => {
  await t.context.connection.down();
});

test('Redis connection: works', async (t) => {
  t.plan(1);
  const promise = pEvent(t.context.connection.getClient(), 'ready');
  await t.context.connection.up();
  await promise;
  t.pass();
});
