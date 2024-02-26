import anyTest, { TestFn } from 'ava';
import { makeDbBeforeAfter, DbContext } from '@pdc/helper-test';

import { MetadataRepositoryProvider } from './MetadataRepositoryProvider';

interface TestContext {
  db: DbContext;
  repository: MetadataRepositoryProvider;
}

const test = anyTest as TestFn<TestContext>;
const { before, after } = makeDbBeforeAfter();

test.before(async (t) => {
  const db = await before();
  t.context.db = db;
  t.context.repository = new MetadataRepositoryProvider(t.context.db.connection);
});

test.after.always(async (t) => {
  await after(t.context.db);
});

test.serial('Should save meta', async (t) => {
  const data = [
    {
      policy_id: 1,
      key: 'my_key',
      value: 0,
      datetime: new Date('2021-01-01'),
    },
    {
      policy_id: 1,
      key: 'my_key_2',
      value: 500,
      datetime: new Date('2021-02-01'),
    },
    {
      policy_id: 1,
      key: 'my_key',
      value: 100,
      datetime: new Date('2021-03-01'),
    },
    {
      policy_id: 1,
      key: 'my_key',
      value: 200,
      datetime: new Date('2021-04-01'),
    },
  ];
  await t.context.repository.set(data);
  const result = await t.context.db.connection.getClient().query({
    text: `
      SELECT policy_id, key, value, datetime
      FROM ${t.context.repository.table}
      WHERE policy_id = $1 ORDER BY datetime
    `,
    values: [1],
  });
  t.deepEqual(result.rows, data);
});

test.serial('Should read meta', async (t) => {
  const result = await t.context.repository.get(1, ['my_key', 'my_key_2']);
  t.deepEqual(result, [
    {
      policy_id: 1,
      key: 'my_key',
      value: 200,
      datetime: new Date('2021-04-01'),
    },
    {
      policy_id: 1,
      key: 'my_key_2',
      value: 500,
      datetime: new Date('2021-02-01'),
    },
  ]);
});

test.serial('Should read meta in past', async (t) => {
  const result = await t.context.repository.get(1, ['my_key', 'my_key_2'], new Date('2021-03-01'));
  t.deepEqual(result, [
    {
      policy_id: 1,
      key: 'my_key',
      value: 100,
      datetime: new Date('2021-03-01'),
    },
    {
      policy_id: 1,
      key: 'my_key_2',
      value: 500,
      datetime: new Date('2021-02-01'),
    },
  ]);
});

test.serial('Should not throw if key not found', async (t) => {
  const result = await t.context.repository.get(1, ['my_key', 'my_key_2', 'unknown_key'], new Date('2021-01-01'));
  t.deepEqual(result, [
    {
      policy_id: 1,
      key: 'my_key',
      value: 0,
      datetime: new Date('2021-01-01'),
    },
  ]);
});

test.serial('Should delete meta', async (t) => {
  const data = [
    {
      policy_id: 1,
      key: 'my_key',
      value: 0,
      datetime: new Date('2021-01-01'),
    },
    {
      policy_id: 1,
      key: 'my_key_2',
      value: 500,
      datetime: new Date('2021-02-01'),
    },
  ];
  await t.context.repository.delete(1, new Date('2021-03-01'));
  const result = await t.context.db.connection.getClient().query({
    text: `
      SELECT policy_id, key, value, datetime
      FROM ${t.context.repository.table}
      WHERE policy_id = $1 ORDER BY datetime
    `,
    values: [1],
  });
  t.deepEqual(result.rows, data);
});
