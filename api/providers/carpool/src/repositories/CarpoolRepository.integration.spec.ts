import anyTest, { TestFn } from 'ava';
import { makeDbBeforeAfter, DbContext } from '@pdc/helper-test';
import { CarpoolRepository } from './CarpoolRepository';
import { insertableCarpool } from '../mocks/database/carpool';

interface TestContext {
  repository: CarpoolRepository;
  operator_id: number;
  db: DbContext;
}

const test = anyTest as TestFn<TestContext>;
const { before, after } = makeDbBeforeAfter();

test.before(async (t) => {
  t.context.operator_id = 1;
  const db = await before();
  t.context.db = db;
  t.context.repository = new CarpoolRepository(t.context.db.connection);
});

test.after.always(async (t) => {
  await after(t.context.db);
});


test.serial('Should create carpool', async (t) => {
  const data = { ...insertableCarpool };

  const carpool = await t.context.repository.register(data);
  const result = await t.context.db.connection.getClient().query({
    text: `
      SELECT *,
        json_build_object(
          'lat', ST_Y(start_position::geometry),
          'lon', ST_X(start_position::geometry)
        ) AS start_position,
        json_build_object(
          'lat', ST_Y(end_position::geometry),
          'lon', ST_X(end_position::geometry)
        ) AS end_position
      FROM ${t.context.repository.table}
      WHERE _id = $1
    `,
    values: [carpool._id],
  });

  t.deepEqual(
    result.rows.pop(),
    { ...carpool, ...data},
  );
});

// test.serial('Should update acquisition', async (t) => {
//   const { operator_id } = t.context;
//   await t.context.db.connection.getClient().query({
//     text: `
//       UPDATE ${t.context.repository.table}
//       SET status = 'ok', try_count = 50
//       WHERE operator_id = $1 AND journey_id = $2
//     `,
//     values: [operator_id, '2'],
//   });
//   const initialData = [{ operator_journey_id: '3' }, { operator_journey_id: '4' }, { operator_journey_id: '5' }].map(
//     createPayload,
//   );
//   const data = [
//     { operator_journey_id: '1', request_id: 'other request id' },
//     { operator_journey_id: '2', request_id: 'other request id' },
//   ].map(createPayload);
// 
//   // 2 is not update because 'ok' status
//   const acqs = await t.context.repository.createOrUpdateMany(data);
//   t.deepEqual(
//     acqs.map((v) => v.operator_journey_id),
//     ['1'],
//   );
// 
//   const result = await t.context.db.connection.getClient().query({
//     text: `
//       SELECT
//         operator_id,
//         journey_id as operator_journey_id,
//         application_id,
//         api_version,
//         request_id,
//         payload,
//         status,
//         try_count
//       FROM ${t.context.repository.table}
//       WHERE operator_id = $1
//       AND request_id IS NOT NULL
//       ORDER BY journey_id
//     `,
//     values: [operator_id],
//   });
// 
//   t.is(result.rowCount, 5);
//   t.deepEqual(
//     result.rows,
//     [...data, ...initialData].map((d) => {
//       if (d.operator_journey_id !== '2') return { ...d, status: 'pending', try_count: 0 };
//       return { ...d, request_id: 'my request id', status: 'ok', try_count: 50 };
//     }),
//   );
// });
// 