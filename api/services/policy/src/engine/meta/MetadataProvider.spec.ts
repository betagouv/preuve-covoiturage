import anyTest, { TestInterface } from 'ava';
import { PostgresConnection } from '@ilos/connection-postgres';

import { MetadataProvider } from './MetadataProvider';
import { MetadataWrapper } from './MetadataWrapper';

interface TestContext {
  repository: MetadataProvider;
  connection: PostgresConnection;
  policyId: number;
}
const test = anyTest as TestInterface<TestContext>;

test.before(async (t) => {
  t.context.policyId = 0;
  t.context.connection = new PostgresConnection({
    connectionString:
      'APP_POSTGRES_URL' in process.env
        ? process.env.APP_POSTGRES_URL
        : 'postgresql://postgres:postgres@localhost:5432/local',
  });

  await t.context.connection.up();
  t.context.repository = new MetadataProvider(t.context.connection);
});

test.beforeEach(async (t) => {
  await t.context.connection.getClient().query({
    text: `DELETE from ${t.context.repository.table} WHERE policy_id = $1`,
    values: [t.context.policyId],
  });
});

test.after.always(async (t) => {
  // clean db
  await t.context.connection.getClient().query({
    text: `DELETE from ${t.context.repository.table} WHERE policy_id = $1`,
    values: [t.context.policyId],
  });

  // shutdown connection
  await t.context.connection.down();
});

test.serial('should always return a metadata wrapper', async (t) => {
  const meta = await t.context.repository.get(t.context.policyId);
  t.true(meta instanceof MetadataWrapper);
  t.is(meta.keys().length, 0);
});

test.serial('should create metadata wrapper on database', async (t) => {
  const meta = await t.context.repository.get(t.context.policyId);
  t.true(meta instanceof MetadataWrapper);
  t.is(meta.keys().length, 0);
  meta.set('toto', 0);

  await t.context.repository.set(t.context.policyId, meta);

  const dbResult = await t.context.connection.getClient().query({
    text: `SELECT value from ${t.context.repository.table} WHERE policy_id = $1 AND key = $2`,
    values: [t.context.policyId, 'toto'],
  });

  t.log(dbResult.rows);
  t.is(dbResult.rowCount, 1);
  t.deepEqual(dbResult.rows, [
    {
      value: 0,
    },
  ]);
});

test.serial('should update metadata wrapper on database', async (t) => {
  const meta = await t.context.repository.get(t.context.policyId);
  t.true(meta instanceof MetadataWrapper);
  t.is(meta.keys().length, 0);
  meta.set('toto', 0);
  await t.context.repository.set(t.context.policyId, meta);

  const meta2 = await t.context.repository.get(t.context.policyId);
  t.is(meta2.keys().length, 1);
  t.is(meta2.get('toto'), 0);
  meta2.set('toto', 1);
  meta2.set('tata', 100);

  await t.context.repository.set(t.context.policyId, meta2);

  const dbResult = await t.context.connection.getClient().query({
    text: `SELECT key, value from ${t.context.repository.table} WHERE policy_id = $1 ORDER BY key`,
    values: [t.context.policyId],
  });

  t.is(dbResult.rowCount, 2);
  t.deepEqual(dbResult.rows, [
    {
      key: 'tata',
      value: 100,
    },
    {
      key: 'toto',
      value: 1,
    },
  ]);
});
