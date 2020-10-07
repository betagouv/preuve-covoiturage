import anyTest, { TestInterface } from 'ava';
import { RedisConnection } from './RedisConnection';

interface Context {
  connection: RedisConnection;
}

const test = anyTest as TestInterface<Context>;

test.before((t) => {
  t.context = {
    connection: new RedisConnection({ connectionString: 'redis://127.0.0.1:6379' }),
  };
});

test.after(async (t) => {
  await t.context.connection.down();
});

test('Redis connection: works', async (t) => {
  t.plan(1);
  t.context.connection.getClient().on('ready', () => {
    t.pass();
  });
  await t.context.connection.up();
});
