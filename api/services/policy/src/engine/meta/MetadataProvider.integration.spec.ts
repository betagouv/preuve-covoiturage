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

  await t.context.repository.set(t.context.policyId, meta, new Date('2021-01-01'));

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

test.serial('should return metadata from database', async (t) => {
  const meta = await t.context.repository.get(t.context.policyId);
  t.true(meta instanceof MetadataWrapper);
  t.is(meta.keys().length, 1);
  const value = meta.get('toto');
  t.is(value, 0);
});

test.serial('should create another metadata wrapper on database', async (t) => {
  const meta = await t.context.repository.get(t.context.policyId);
  t.true(meta instanceof MetadataWrapper);
  t.is(meta.keys().length, 1);
  meta.set('toto', 1);
  await t.context.repository.set(t.context.policyId, meta, new Date('2021-02-01'));

  const meta2 = await t.context.repository.get(t.context.policyId);
  t.is(meta2.keys().length, 1);
  t.is(meta2.get('toto'), 1);
  meta2.set('toto', 2);
  meta2.set('tata', 100);

  await t.context.repository.set(t.context.policyId, meta2, new Date('2021-03-01'));

  const dbResult = await t.context.connection.getClient().query({
    text: `SELECT key, value from ${t.context.repository.table} WHERE policy_id = $1 ORDER BY key, datetime`,
    values: [t.context.policyId],
  });

  t.is(dbResult.rowCount, 4);
  t.deepEqual(dbResult.rows, [
    {
      key: 'tata',
      value: 100,
    },
    {
      key: 'toto',
      value: 0,
    },
    {
      key: 'toto',
      value: 1,
    },
    {
      key: 'toto',
      value: 2,
    },
  ]);

  const meta3 = await t.context.repository.get(t.context.policyId);
  t.is(meta3.keys().length, 2);
  t.is(meta3.get('toto'), 2);
  t.is(meta3.get('tata'), 100);
});

test.serial('should get old meta if asked at datetime', async (t) => {
  const meta = await t.context.repository.get(t.context.policyId, ['toto'], new Date('2021-02-01'));
  t.true(meta instanceof MetadataWrapper);
  t.is(meta.keys().length, 1);
  const value = meta.get('toto');
  t.is(value, 1);
});

test.serial('should delete from datetime', async (t) => {
  await t.context.repository.delete(t.context.policyId, new Date('2021-03-01'));

  const dbResult = await t.context.connection.getClient().query({
    text: `SELECT key, value from ${t.context.repository.table} WHERE policy_id = $1 ORDER BY key, datetime`,
    values: [t.context.policyId],
  });
  
  t.is(dbResult.rowCount, 2);
  
  t.deepEqual(dbResult.rows, [
    {
      key: 'toto',
      value: 0,
    },
    {
      key: 'toto',
      value: 1,
    },
  ]);
});

test.serial('should delete', async (t) => {
  await t.context.repository.delete(t.context.policyId); 

  const dbResult = await t.context.connection.getClient().query({
    text: `SELECT key, value from ${t.context.repository.table} WHERE policy_id = $1 ORDER BY key, datetime`,
    values: [t.context.policyId],
  });
  
  t.is(dbResult.rowCount, 0);
});
