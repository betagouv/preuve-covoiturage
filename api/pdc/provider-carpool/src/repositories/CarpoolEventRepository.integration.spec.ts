import anyTest, { TestFn } from 'ava';
import { makeDbBeforeAfter, DbContext } from '@pdc/helper-test';
import { CarpoolRepository } from './CarpoolRepository';
import { CarpoolEventRepository } from './CarpoolEventRepository';
import { insertableCarpool } from '../mocks/database/carpool';
import { Id } from '../interfaces';
import { insertableAcquisitionEvent } from '../mocks/database/event';
import sql, { raw } from '../helpers/sql';

interface TestContext {
  repository: CarpoolEventRepository;
  carpoolRepository: CarpoolRepository;
  db: DbContext;
  carpool_id: Id;
}

const test = anyTest as TestFn<TestContext>;
const { before, after } = makeDbBeforeAfter();

test.before(async (t) => {
  const db = await before();
  t.context.db = db;
  t.context.repository = new CarpoolEventRepository(t.context.db.connection);
  t.context.carpoolRepository = new CarpoolRepository(t.context.db.connection);
  const carpool = await t.context.carpoolRepository.register(insertableCarpool);
  t.context.carpool_id = carpool._id;
});

test.after.always(async (t) => {
  await after(t.context.db);
});

test.serial('Should create acquisition event', async (t) => {
  const data = { ...insertableAcquisitionEvent, carpool_id: t.context.carpool_id };

  await t.context.repository.saveAcquisitionEvent(data);
  const result = await t.context.db.connection.getClient().query(sql`
    SELECT carpool_id, request_id, status FROM ${raw(t.context.repository.acquisitionEventTable)}
    WHERE carpool_id = ${t.context.carpool_id}
  `);

  t.deepEqual(result.rows.pop(), data);
});

test.serial('Should create status', async (t) => {
  await t.context.repository.syncStatus(t.context.carpool_id);
  const result = await t.context.db.connection.getClient().query(sql`
    SELECT acquisition_status FROM ${raw(t.context.repository.statusTable)}
    WHERE carpool_id = ${t.context.carpool_id}
  `);

  t.deepEqual(result.rows.pop(), { acquisition_status: insertableAcquisitionEvent.status });
});
