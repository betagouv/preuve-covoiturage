import anyTest, { TestFn } from 'ava';
import { makeDbBeforeAfter, DbContext } from '@pdc/providers/test';
import { CarpoolRepository } from './CarpoolRepository';
import { CarpoolGeoRepository } from './CarpoolGeoRepository';
import { insertableCarpool } from '../mocks/database/carpool';
import { Id } from '../interfaces';
import sql, { raw } from '../helpers/sql';
import { upsertableGeoError, upsertableGeoSuccess } from '../mocks/database/geo';
import { PoolClient } from '@ilos/connection-postgres';

interface TestContext {
  repository: CarpoolGeoRepository;
  carpoolRepository: CarpoolRepository;
  db: DbContext;
  carpool_id: Id;
  conn: PoolClient;
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

test.beforeEach(async (t) => {
  t.context.conn = await t.context.db.connection.getClient().connect();
});

test.afterEach.always(t => {
  t.context.conn.release();
})

test.serial('Should create geo', async (t) => {
  const conn = t.context.conn;
  const processable = await t.context.repository.findProcessable({ limit: 1, from: insertableCarpool.start_datetime, to: insertableCarpool.end_datetime }, conn);
  t.deepEqual(processable, [{ carpool_id: t.context.carpool_id, start: insertableCarpool.start_position, end: insertableCarpool.end_position }]);
  const data = { ...upsertableGeoSuccess, carpool_id: processable[0].carpool_id };
  await t.context.repository.upsert(data, conn);
  const result = await conn.query(sql`
    SELECT carpool_id, start_geo_code, end_geo_code FROM ${raw(t.context.repository.table)}
    WHERE carpool_id = ${t.context.carpool_id}
  `);
  t.deepEqual(result.rows.pop(), data);
});

test.serial('Should do nothing if geo exists', async (t) => {
  const conn = t.context.conn;
  const processable = await t.context.repository.findProcessable({ limit: 1, from: insertableCarpool.start_datetime, to: insertableCarpool.end_datetime }, conn);
  t.is(processable.length, 0);
  await conn.query(sql`
    DELETE FROM ${raw(t.context.repository.table)}
    WHERE carpool_id = ${t.context.carpool_id}
  `);
});

test.serial('Should create status', async (t) => {
  const conn = t.context.conn;
  const processable = await t.context.repository.findProcessable({ limit: 1, from: insertableCarpool.start_datetime, to: insertableCarpool.end_datetime }, conn);
  t.deepEqual(processable, [{ carpool_id: t.context.carpool_id, start: insertableCarpool.start_position, end: insertableCarpool.end_position }]);
  const data = { ...upsertableGeoError, carpool_id: processable[0].carpool_id };
  await t.context.repository.upsert(data, conn);
  const result = await conn.query(sql`
    SELECT errors FROM ${raw(t.context.repository.table)}
    WHERE carpool_id = ${t.context.carpool_id}
  `);
  t.deepEqual(result.rows.pop(), { errors: JSON.parse(JSON.stringify([data.error])) });
});
