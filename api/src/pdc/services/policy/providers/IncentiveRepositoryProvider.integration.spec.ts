import { anyTest, TestFn } from '@/dev_deps.ts';
import { makeDbBeforeAfter, DbContext } from '@/pdc/providers/test/index.ts';

import { IncentiveRepositoryProvider } from './IncentiveRepositoryProvider.ts';
import { IncentiveStateEnum, IncentiveStatusEnum } from '../interfaces/index.ts';

interface TestContext {
  db: DbContext;
  repository: IncentiveRepositoryProvider;
}

const test = anyTest as TestFn<TestContext>;
const { before, after } = makeDbBeforeAfter();

test.before(async (t) => {
  const db = await before();
  t.context.db = db;
  t.context.repository = new IncentiveRepositoryProvider(t.context.db.connection);
});

test.after.always(async (t) => {
  await after(t.context.db);
});

test.serial('Should create many incentives', async (t) => {
  const incentives = [
    {
      _id: undefined,
      policy_id: 0,
      operator_id: 1,
      operator_journey_id: 'operator_journey_id-1',
      datetime: new Date('2024-03-15'),
      statelessAmount: 0,
      statefulAmount: 0,
      status: IncentiveStatusEnum.Draft,
      state: IncentiveStateEnum.Regular,
      meta: [],
    },

    // same operator_id / operator_journey_id
    // -> should update the existing incentive
    {
      _id: undefined,
      policy_id: 0,
      operator_id: 1,
      operator_journey_id: 'operator_journey_id-1',
      datetime: new Date('2024-03-15'),
      statelessAmount: 100,
      statefulAmount: 100,
      status: IncentiveStatusEnum.Draft,
      state: IncentiveStateEnum.Regular,
      meta: [],
    },
    {
      _id: undefined,
      policy_id: 0,
      operator_id: 1,
      operator_journey_id: 'operator_journey_id-2',
      datetime: new Date('2024-03-16'),
      statelessAmount: 200,
      statefulAmount: 200,
      status: IncentiveStatusEnum.Draft,
      state: IncentiveStateEnum.Regular,
      meta: [
        {
          uuid: 'uuid',
          key: 'key',
        },
      ],
    },
  ];

  await t.context.repository.createOrUpdateMany(incentives);

  const incentiveResults = await t.context.db.connection.getClient().query({
    text: `SELECT * FROM ${t.context.repository.incentivesTable} WHERE policy_id = $1`,
    values: [0],
  });
  t.is(incentiveResults.rowCount, 2);
  t.is(incentiveResults.rows.find((i) => i.operator_journey_id === 'operator_journey_id-1').result, 100);
  t.is(incentiveResults.rows.find((i) => i.operator_journey_id === 'operator_journey_id-2').result, 200);
});

test.serial('Should update many incentives', async (t) => {
  const incentives = [
    // update
    {
      _id: undefined,
      policy_id: 0,
      operator_id: 1,
      operator_journey_id: 'operator_journey_id-1',
      datetime: new Date('2024-03-15'),
      statelessAmount: 0,
      statefulAmount: 0,
      status: IncentiveStatusEnum.Draft,
      state: IncentiveStateEnum.Regular,
      meta: [
        {
          uuid: 'uuid',
          key: 'key',
        },
      ],
    },

    // update
    {
      _id: undefined,
      policy_id: 0,
      operator_id: 1,
      operator_journey_id: 'operator_journey_id-2',
      datetime: new Date('2024-03-16'),
      statelessAmount: 500,
      statefulAmount: 500,
      status: IncentiveStatusEnum.Draft,
      state: IncentiveStateEnum.Regular,
      meta: [],
    },

    // create
    {
      _id: undefined,
      policy_id: 0,
      operator_id: 1,
      operator_journey_id: 'operator_journey_id-3',
      datetime: new Date('2024-03-16'),
      statelessAmount: 100,
      statefulAmount: 100,
      status: IncentiveStatusEnum.Draft,
      state: IncentiveStateEnum.Regular,
      meta: [],
    },
  ];

  await t.context.repository.createOrUpdateMany(incentives);

  const incentiveResults = await t.context.db.connection.getClient().query({
    text: `SELECT * FROM ${t.context.repository.incentivesTable} WHERE policy_id = $1`,
    values: [0],
  });

  t.is(incentiveResults.rowCount, 3);
  t.is(incentiveResults.rows.find((i) => i.operator_journey_id === 'operator_journey_id-1').result, 0);
  t.is(incentiveResults.rows.find((i) => i.operator_journey_id === 'operator_journey_id-1').state, 'null');
  t.is(incentiveResults.rows.find((i) => i.operator_journey_id === 'operator_journey_id-2').result, 500);
  t.is(incentiveResults.rows.find((i) => i.operator_journey_id === 'operator_journey_id-3').result, 100);
});

test.serial('Should update many incentives amount', async (t) => {
  const incentives = await t.context.db.connection.getClient().query({
    text: `SELECT * FROM ${t.context.repository.incentivesTable} WHERE policy_id = $1`,
    values: [0],
  });

  const data = incentives.rows.map((i) => ({ ...i, statefulAmount: 0 }));
  await t.context.repository.updateStatefulAmount(data as any);

  const incentiveResults = await t.context.db.connection.getClient().query({
    text: `SELECT * FROM ${t.context.repository.incentivesTable} WHERE policy_id = $1`,
    values: [0],
  });

  t.is(incentiveResults.rowCount, 3);
  t.is(incentiveResults.rows.filter((i) => i.state === 'null').length, 3);
});

test.serial('Should list draft incentive', async (t) => {
  const cursor = t.context.repository.findDraftIncentive(new Date());
  const { value } = await cursor.next();
  await cursor.next();
  t.true(Array.isArray(value));
  const incentives = (Array.isArray(value) ? value : []).map((v) => ({
    operator_id: v.operator_id,
    operator_journey_id: v.operator_journey_id,
    statefulAmount: v.statefulAmount,
    statelessAmount: v.statelessAmount,
  }));
  t.deepEqual(incentives, [
    {
      operator_id: 1,
      operator_journey_id: 'operator_journey_id-1',
      statefulAmount: 0,
      statelessAmount: 0,
    },
    {
      operator_id: 1,
      operator_journey_id: 'operator_journey_id-2',
      statefulAmount: 0,
      statelessAmount: 500,
    },
    {
      operator_id: 1,
      operator_journey_id: 'operator_journey_id-3',
      statefulAmount: 0,
      statelessAmount: 100,
    },
  ]);
});
