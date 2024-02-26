import anyTest, { TestFn } from 'ava';
import { PostgresConnection } from './PostgresConnection';

interface TestContext {
  connection: PostgresConnection;
}

const test = anyTest as TestFn<TestContext>;
test.before(async (t) => {
  const connection = new PostgresConnection({ connectionString: process.env.APP_POSTGRES_URL });
  await connection.up();
  t.context = { connection };
});

test.after(async (t) => {
  await t.context.connection.down();
  t.log('PostgresConnection closed');
});

test.serial('Cursor 10 entries', async (t) => {
  const cursor = await t.context.connection.getCursor('SELECT * FROM generate_series(1, 20)', []);
  t.true('read' in cursor);
  t.true('release' in cursor);

  const count = 10;
  const parts = await cursor.read(count);
  t.is(parts.length, count);

  await cursor.release();
});

test.serial('Cursor loop through all entries', async (t) => {
  const rowCount = 1000;
  const cursor = await t.context.connection.getCursor(`SELECT * FROM generate_series(1, ${rowCount})`, []);
  t.true('read' in cursor);
  t.true('release' in cursor);

  let total = 0;
  let count = 100;
  do {
    const parts = await cursor.read(100);
    count = parts.length;
    total += parts.length;
  } while (count > 0);

  t.is(total, rowCount);

  await cursor.release();
});
