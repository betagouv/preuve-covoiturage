import { anyTest, TestFn } from '@/dev_deps.ts';
import { makeDbBeforeAfter, DbContext } from '@/pdc/providers/test/index.ts';
import { CarpoolRepository } from './CarpoolRepository.ts';
import { CarpoolStatusRepository } from './CarpoolStatusRepository.ts';
import { insertableCarpool } from '../mocks/database/carpool.ts';
import { Id } from '../interfaces/index.ts';
import { insertableAcquisitionStatus } from '../mocks/database/status.ts';
import sql, { raw } from '../helpers/sql.ts';

interface TestContext {
  repository: CarpoolStatusRepository;
  carpoolRepository: CarpoolRepository;
  db: DbContext;
  carpool_id: Id;
}

const test = anyTest as TestFn<TestContext>;
const { before, after } = makeDbBeforeAfter();

test.before(async (t) => {
  const db = await before();
  t.context.db = db;
  t.context.repository = new CarpoolStatusRepository(t.context.db.connection);
  t.context.carpoolRepository = new CarpoolRepository(t.context.db.connection);
  const carpool = await t.context.carpoolRepository.register(insertableCarpool);
  t.context.carpool_id = carpool._id;
});

test.after.always(async (t) => {
  await after(t.context.db);
});

test.serial('Should create acquisition status', async (t) => {
  const data = { ...insertableAcquisitionStatus, carpool_id: t.context.carpool_id };

  await t.context.repository.saveAcquisitionStatus(data);
  const result = await t.context.db.connection.getClient().query(sql`
    SELECT * FROM ${raw(t.context.repository.table)}
    WHERE carpool_id = ${t.context.carpool_id}
  `);

  t.is(result.rows.pop()?.acquisition_status, data.status);
});
