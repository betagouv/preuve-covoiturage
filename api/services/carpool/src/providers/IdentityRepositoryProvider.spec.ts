import anyTest, { TestInterface } from 'ava';
import { PostgresConnection } from '@ilos/connection-postgres';

import { IdentityRepositoryProvider } from './IdentityRepositoryProvider';

interface TestContext {
  connection: PostgresConnection;
  repository: IdentityRepositoryProvider;
}

const test = anyTest as TestInterface<TestContext>;

test.before(async (t) => {
  t.context.connection = new PostgresConnection({
    connectionString:
      'APP_POSTGRES_URL' in process.env
        ? process.env.APP_POSTGRES_URL
        : 'postgresql://postgres:postgres@localhost:5432/local',
  });
  await t.context.connection.up();
  t.context.repository = new IdentityRepositoryProvider(t.context.connection);
});

test.after.always(async (t) => {
  const identityIds = await t.context.connection.getClient().query({
    text: `DELETE FROM ${t.context.repository.table} WHERE phone like $1 OR phone_trunc = $2 RETURNING _id`,
    values: ['%00000000%', '00000000'],
  });

  await t.context.connection.getClient().query({
    text: `DELETE FROM carpool.carpools WHERE _id = ANY($1::int[])`,
    values: [identityIds.rows.map((r) => r._id)],
  });

  await t.context.connection.down();
});

test.serial('Should save identity', async (t) => {
  const { _id, uuid } = await t.context.repository.create(
    {
      phone: '0000000000',
    },
    { operator_id: 1 },
  );
  t.is(typeof uuid, 'string');
  t.is(typeof _id, 'number');

  const r = await t.context.connection.getClient().query({
    text: `SELECT _id, uuid from ${t.context.repository.table} WHERE _id = $1`,
    values: [_id],
  });
  t.is(r.rowCount, 1);
  t.is(r.rows[0].uuid, uuid);
});

test.serial('Should delete identity', async (t) => {
  const rid = await t.context.connection.getClient().query({
    text: `SELECT _id from ${t.context.repository.table} WHERE phone = $1`,
    values: ['0000000000'],
  });
  const id = rid.rows[0]._id;
  await t.context.repository.delete(id);

  const r = await t.context.connection.getClient().query({
    text: `SELECT * from ${t.context.repository.table} WHERE _id = $1`,
    values: [id],
  });
  t.is(r.rowCount, 0);
});

test.serial('Should share uuid when phone is the same', async (t) => {
  const { uuid: uuidt } = await t.context.repository.create(
    {
      phone: '0000000009',
    },
    { operator_id: 1 },
  );

  const { uuid: uuid1 } = await t.context.repository.create(
    {
      phone: '0000000000',
    },
    { operator_id: 1 },
  );

  const { uuid: uuid2 } = await t.context.repository.create(
    {
      phone: '0000000000',
    },
    { operator_id: 1 },
  );

  t.is(uuid1, uuid2);
  t.not(uuid1, uuidt);
});

test.serial('Should share uuid when phone trunc and operator user id is the same', async (t) => {
  const { _id: idt, uuid: uuidt } = await t.context.repository.create(
    {
      phone: '0000000009',
      phone_trunc: '00000000',
      operator_user_id: '12345',
    },
    { operator_id: 1 },
  );

  t.is(typeof idt, 'number');

  await t.context.connection.getClient().query({
    text: 'INSERT INTO carpool.carpools (identity_id, operator_id, cost) VALUES ($1::int, $2::int, 0::int)',
    values: [idt, 1],
  });

  const { _id: id1, uuid: uuid1 } = await t.context.repository.create(
    {
      phone: '0000000001',
      phone_trunc: '00000000',
      operator_user_id: '12345',
    },
    { operator_id: 2 },
  );

  t.is(typeof id1, 'number');

  await t.context.connection.getClient().query({
    text: 'INSERT INTO carpool.carpools (identity_id, operator_id, cost) VALUES ($1::int, $2::int, 0::int)',
    values: [id1, 2],
  });

  const { uuid: uuid2 } = await t.context.repository.create(
    {
      phone: '0000000002',
      phone_trunc: '00000000',
      operator_user_id: '12345',
    },
    { operator_id: 2 },
  );

  t.is(uuid1, uuid2);
  t.not(uuid1, uuidt);
});

test.serial('Should share uuid when phone trunc and pass user id is the same', async (t) => {
  const { uuid: uuidt } = await t.context.repository.create(
    {
      phone: '0000000009',
      phone_trunc: '00000000',
      travel_pass_name: 'idfm',
      travel_pass_user_id: '12346',
    },
    { operator_id: 1 },
  );

  const { uuid: uuid1 } = await t.context.repository.create(
    {
      phone: '0000000001',
      phone_trunc: '00000000',
      travel_pass_name: 'idfm',
      travel_pass_user_id: '12345',
    },
    { operator_id: 1 },
  );

  const { uuid: uuid2 } = await t.context.repository.create(
    {
      phone: '0000000002',
      phone_trunc: '00000000',
      travel_pass_name: 'idfm',
      travel_pass_user_id: '12345',
    },
    { operator_id: 1 },
  );

  t.is(uuid1, uuid2);
  t.not(uuid1, uuidt);
});
