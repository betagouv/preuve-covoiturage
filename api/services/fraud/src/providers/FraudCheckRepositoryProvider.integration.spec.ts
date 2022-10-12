import anyTest, { TestFn } from 'ava';
import { PostgresConnection } from '@ilos/connection-postgres';

import { FraudCheckRepositoryProvider } from './FraudCheckRepositoryProvider';
import { FraudCheck, FraudCheckStatusEnum } from '../interfaces';
import { checks } from '../engine/checks';

const checkList = checks.sort((a, b) => (a.key > b.key ? 1 : a.key < b.key ? -1 : 0));

interface TestContext {
  repository: FraudCheckRepositoryProvider;
  connection: PostgresConnection;
  acquisition_id: number;
  data: FraudCheck[];
}

const test = anyTest as TestFn<TestContext>;

test.before.skip(async (t) => {
  t.context.connection = new PostgresConnection({ connectionString: process.env.APP_POSTGRES_URL });
  await t.context.connection.up();

  t.context.repository = new FraudCheckRepositoryProvider(t.context.connection);
  t.context.acquisition_id = 1;
  t.context.data = [
    {
      method: checkList[0].key,
      status: FraudCheckStatusEnum.Done,
      karma: 50,
      meta: null,
    },
    {
      method: checkList[1].key,
      status: FraudCheckStatusEnum.Done,
      karma: 50,
      meta: null,
    },
    {
      method: checkList[2].key,
      status: FraudCheckStatusEnum.Error,
      karma: 50,
      meta: {
        error: 'I cant believe it',
      },
    },
  ];
});

test.after.always.skip(async (t) => {
  await t.context.connection.getClient().query({
    text: `DELETE FROM ${t.context.repository.table} WHERE acquisition_id = $1::int`,
    values: [t.context.acquisition_id],
  });
  await t.context.connection.down();
});

test.serial.skip('Should create fraudcheck entries', async (t) => {
  await t.context.repository.createOrUpdate({
    acquisition_id: t.context.acquisition_id,
    karma: 0,
    data: t.context.data,
    status: FraudCheckStatusEnum.Error,
  });

  const result = await t.context.connection.getClient().query({
    text: `
      SELECT
        t.acquisition_id,
        d.status,
        d.karma,
        d.method,
        d.meta
      FROM ${t.context.repository.table} as t
      LEFT JOIN UNNEST(t.data) AS d ON true
      WHERE t.acquisition_id = $1::int
      ORDER BY d.method
    `,
    values: [t.context.acquisition_id],
  });
  t.is(result.rowCount, t.context.data.length);
  t.deepEqual(
    result.rows,
    t.context.data.map((d) => ({ ...d, acquisition_id: t.context.acquisition_id })),
  );
});

test.serial.skip('Should get fraudcheck entries', async (t) => {
  const data = await t.context.repository.get(t.context.acquisition_id);
  t.deepEqual(data, {
    acquisition_id: t.context.acquisition_id,
    status: FraudCheckStatusEnum.Error,
    karma: 0,
    data: t.context.data,
  });
});

// test.serial.skip('Should update fraudcheck entries', async (t) => {
//   const data = [...t.context.data];
//   const karma = 50;
//   checkList.map((method) => {
//     const methodIndex = data.findIndex((d) => d.method === method.key);
//     if (methodIndex === -1) {
//       data.push({
//         karma,
//         method: method.key,
//         status: FraudCheckStatusEnum.Done,
//         error: null,
//       });
//     } else if (data[methodIndex].status !== FraudCheckStatusEnum.Done) {
//       data[methodIndex].status = FraudCheckStatusEnum.Done;
//     }
//   });
//   await t.context.repository.createOrUpdate(t.context.acquisition_id, 0, data);
//   const result = await t.context.connection.getClient().query({
//     text: `
//       SELECT
//         acquisition_id, method, status, karma, meta->>'error' as error
//       FROM ${t.context.repository.table}
//       WHERE acquisition_id = $1::int
//       ORDER BY method
//     `,
//     values: [t.context.acquisition_id],
//   });
//   t.is(result.rowCount, data.length);
//   t.deepEqual(
//     result.rows.map((r) => ({ ...r, error: JSON.parse(r.error) })),
//     data,
//   );
// });

// test.serial.skip('Should get score', async (t) => {
//   const score = await t.context.repository.getScore(t.context.acquisition_id);
//   const doneCheck = t.context.data.filter((c) => c.status === FraudCheckStatusEnum.Done);
//   const fromDataScore = doneCheck.map((c) => c.karma).reduce((sum, i) => sum + i, 0) / doneCheck.length;

//   t.is(score, fromDataScore);
// });
