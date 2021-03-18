import anyTest, { TestInterface } from 'ava';
import { PostgresConnection } from '@ilos/connection-postgres';

import { IncentiveRepositoryProvider } from './IncentiveRepositoryProvider';
import { IncentiveStateEnum, IncentiveStatusEnum } from '../interfaces';

interface TestContext {
  connection: PostgresConnection;
  repository: IncentiveRepositoryProvider;
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
  t.context.repository = new IncentiveRepositoryProvider(t.context.connection);
});

test.after.always(async (t) => {
  await t.context.connection.getClient().query({
    text: `DELETE FROM ${t.context.repository.table} WHERE policy_id = $1`,
    values: [0],
  });
  await t.context.connection.down();
});

test.serial('Should create many incentives', async (t) => {
  const incentives = [
    {
      policy_id: 0,
      carpool_id: 1,
      datetime: new Date(),
      result: 0,
      amount: 0,
      status: IncentiveStatusEnum.Draft,
      state: IncentiveStateEnum.Regular,
      meta: {},
    },
    {
      policy_id: 0,
      carpool_id: 1,
      datetime: new Date(),
      result: 100,
      amount: 100,
      status: IncentiveStatusEnum.Draft,
      state: IncentiveStateEnum.Regular,
      meta: {},
    },
    {
      policy_id: 0,
      carpool_id: 2,
      datetime: new Date(),
      result: 200,
      amount: 200,
      status: IncentiveStatusEnum.Draft,
      state: IncentiveStateEnum.Regular,
      meta: {
        my: 'meta',
      },
    },
  ];

  await t.context.repository.createOrUpdateMany(incentives);

  const incentiveResults = await t.context.connection.getClient().query({
    text: `SELECT * FROM ${t.context.repository.table} WHERE policy_id = $1`,
    values: [0],
  });
  t.is(incentiveResults.rowCount, 2);
  t.is(incentiveResults.rows.find((i) => i.carpool_id === 1).result, 100);
  t.is(incentiveResults.rows.find((i) => i.carpool_id === 2).result, 200);
});

test.serial('Should update many incentives', async (t) => {
  const incentives = [
    {
      policy_id: 0,
      carpool_id: 1,
      datetime: new Date(),
      result: 0,
      amount: 0,
      status: IncentiveStatusEnum.Draft,
      state: IncentiveStateEnum.Regular,
      meta: {},
    },
    {
      policy_id: 0,
      carpool_id: 2,
      datetime: new Date(),
      result: 500,
      amount: 500,
      status: IncentiveStatusEnum.Draft,
      state: IncentiveStateEnum.Regular,
      meta: {
        my: 'meta',
      },
    },
    {
      policy_id: 0,
      carpool_id: 3,
      datetime: new Date(),
      result: 100,
      amount: 100,
      status: IncentiveStatusEnum.Draft,
      state: IncentiveStateEnum.Regular,
      meta: {},
    },
  ];

  await t.context.repository.createOrUpdateMany(incentives);

  const incentiveResults = await t.context.connection.getClient().query({
    text: `SELECT * FROM ${t.context.repository.table} WHERE policy_id = $1`,
    values: [0],
  });

  t.is(incentiveResults.rowCount, 3);
  t.is(incentiveResults.rows.find((i) => i.carpool_id === 1).result, 0);
  t.is(incentiveResults.rows.find((i) => i.carpool_id === 1).state, 'null');
  t.is(incentiveResults.rows.find((i) => i.carpool_id === 2).result, 500);
  t.is(incentiveResults.rows.find((i) => i.carpool_id === 3).result, 100);
});

test.serial('Should update many incentives amount', async (t) => {
  const data = [
    {
      policy_id: 0,
      carpool_id: 3,
      amount: 0,
    },
    {
      policy_id: 0,
      carpool_id: 2,
      amount: 0,
    },
  ];

  await t.context.repository.updateManyAmount(data);

  const incentiveResults = await t.context.connection.getClient().query({
    text: `SELECT * FROM ${t.context.repository.table} WHERE policy_id = $1`,
    values: [0],
  });

  t.log(incentiveResults.rows);
  t.is(incentiveResults.rowCount, 3);
  t.is(incentiveResults.rows.filter((i) => i.state === 'null').length, 3);
});
