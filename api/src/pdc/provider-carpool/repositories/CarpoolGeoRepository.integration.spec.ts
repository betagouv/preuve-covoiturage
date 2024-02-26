import anyTest, { TestFn } from 'ava';
import { makeDbBeforeAfter, DbContext } from '@pdc/provider-test';
import { CarpoolRepository } from './CarpoolRepository';
import { CarpoolGeoRepository } from './CarpoolGeoRepository';
import { insertableCarpool } from '../mocks/database/carpool';
import { Id } from '../interfaces';
import sql, { raw } from '../helpers/sql';
import { upsertableGeoError, upsertableGeoSuccess } from '../mocks/database/geo';

interface TestContext {
  repository: CarpoolGeoRepository;
  carpoolRepository: CarpoolRepository;
  db: DbContext;
  carpool_id: Id;
}

const test = anyTest as TestFn<TestContext>;
const { before, after } = makeDbBeforeAfter();

test.before(async (t) => {
  const db = await before();
  t.context.db = db;
  t.context.repository = new CarpoolGeoRepository(t.context.db.connection);
  t.context.carpoolRepository = new CarpoolRepository(t.context.db.connection);
  const carpool = await t.context.carpoolRepository.register(insertableCarpool);
  t.context.carpool_id = carpool._id;
});

test.after.always(async (t) => {
  await after(t.context.db);
});

test.serial('Should create geo', async (t) => {
  const data = { ...upsertableGeoSuccess, carpool_id: t.context.carpool_id };
  await t.context.repository.upsert(data);
  const result = await t.context.db.connection.getClient().query(sql`
    SELECT carpool_id, start_geo_code, end_geo_code FROM ${raw(t.context.repository.table)}
    WHERE carpool_id = ${t.context.carpool_id}
  `);

  t.deepEqual(result.rows.pop(), data);
});

test.serial('Should create status', async (t) => {
  const data = { ...upsertableGeoError, carpool_id: t.context.carpool_id };
  await t.context.repository.upsert(data);
  const result = await t.context.db.connection.getClient().query(sql`
    SELECT errors FROM ${raw(t.context.repository.table)}
    WHERE carpool_id = ${t.context.carpool_id}
  `);

  t.deepEqual(result.rows.pop(), { errors: JSON.parse(JSON.stringify([data.error])) });
});
