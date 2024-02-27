import anyTest, { TestFn } from 'ava';
import { makeDbBeforeAfter, DbContext } from '@pdc/providers/test';
import { CarpoolRepository } from './CarpoolRepository';
import { insertableCarpool, updatableCarpool } from '../mocks/database/carpool';
import { Id, IncentiveCounterpartTarget } from '../interfaces';

interface TestContext {
  repository: CarpoolRepository;
  db: DbContext;
}

const test = anyTest as TestFn<TestContext>;
const { before, after } = makeDbBeforeAfter();

test.before(async (t) => {
  const db = await before();
  t.context.db = db;
  t.context.repository = new CarpoolRepository(t.context.db.connection);
});

test.after.always(async (t) => {
  await after(t.context.db);
});

async function getCarpool(context: TestContext, id: Id) {
  const result = await context.db.connection.getClient().query({
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
      FROM ${context.repository.table}
      WHERE _id = $1
    `,
    values: [id],
  });

  const incentiveResult = await context.db.connection.getClient().query({
    text: `SELECT idx, siret, amount FROM ${context.repository.incentiveTable} WHERE carpool_id = $1`,
    values: [id],
  });

  const incentiveCounterpartResult = await context.db.connection.getClient().query({
    text: `
      SELECT
        target_is_driver, siret, amount
      FROM ${context.repository.incentiveCounterpartTable}
      WHERE carpool_id = $1`,
    values: [id],
  });

  return {
    ...result.rows.pop(),
    incentives: incentiveResult.rows.map(({ idx, siret, amount }) => ({ index: idx, siret, amount })),
    incentive_counterparts: incentiveCounterpartResult.rows.map(({ target_is_driver, siret, amount }) => ({
      target: target_is_driver ? IncentiveCounterpartTarget.Driver : IncentiveCounterpartTarget.Passenger,
      siret,
      amount,
    })),
  };
}

test.serial('Should create carpool', async (t) => {
  const data = { ...insertableCarpool };

  const carpool = await t.context.repository.register(data);
  const result = await getCarpool(t.context, carpool._id);

  t.deepEqual(result, { ...carpool, ...data });
});

test.serial('Should update acquisition', async (t) => {
  const insertData = { ...insertableCarpool, operator_journey_id: 'journey_2' };

  const carpool = await t.context.repository.register(insertData);

  const updateData = { ...updatableCarpool };
  await t.context.repository.update(insertData.operator_id, insertData.operator_journey_id, updateData);

  const result = await getCarpool(t.context, carpool._id);
  t.deepEqual(result, { ...carpool, ...insertData, ...updateData });
});
