import anyTest, { TestInterface } from 'ava';
import { RedisConnection } from './RedisConnection';

interface Context {
  connection: RedisConnection;
}

const test = anyTest as TestInterface<Context>;

test.before((t) => {
  t.context = {
    connection: new RedisConnection({ connectionString: process.env.APP_REDIS_URL ?? 'redis://127.0.0.1:6379' }),
  };
});

test.after(async (t) => {
  await t.context.connection.down();
});

test.cb('Redis connection: works', (t) => {
  t.plan(1);
  t.context.connection.getClient().on('ready', () => {
    t.pass();
    t.end();
  });
  t.context.connection.up();
});
