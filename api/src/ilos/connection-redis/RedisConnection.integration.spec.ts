import anyTest, { TestFn } from 'ava';
import { RedisConnection } from './RedisConnection';

interface Context {
  connection: RedisConnection;
}

const test = anyTest as TestFn<Context>;

test.before((t) => {
  t.context = {
    connection: new RedisConnection(process.env.APP_REDIS_URL ?? 'redis://127.0.0.1:6379'),
  };
});

test.after(async (t) => {
  await t.context.connection.down();
});

test('Redis connection: works', async (t) => {
  t.plan(1);
  const client = t.context.connection.getClient();
  client.on('ready', () => {
    t.pass();
  });
  await t.context.connection.up();
  t.pass();
});
