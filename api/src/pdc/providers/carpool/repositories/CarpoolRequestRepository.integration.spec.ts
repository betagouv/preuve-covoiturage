import { anyTest, TestFn } from '@/dev_deps.ts';
import { makeDbBeforeAfter, DbContext } from '@/pdc/providers/test/index.ts';
import { CarpoolRepository } from './CarpoolRepository.ts';
import { insertableCarpool } from '../mocks/database/carpool.ts';
import { Id } from '../interfaces/index.ts';
import sql, { raw } from '../helpers/sql.ts';
import { CarpoolRequestRepository } from './CarpoolRequestRepository.ts';
import { insertableCarpoolCancelRequest, insertableCarpoolCreateRequest } from '../mocks/database/request.ts';

interface TestContext {
  repository: CarpoolRequestRepository;
  carpoolRepository: CarpoolRepository;
  db: DbContext;
  carpool_id: Id;
}

const test = anyTest as TestFn<TestContext>;
const { before, after } = makeDbBeforeAfter();

test.before(async (t) => {
  const db = await before();
  t.context.db = db;
  t.context.repository = new CarpoolRequestRepository(t.context.db.connection);
  t.context.carpoolRepository = new CarpoolRepository(t.context.db.connection);
  const carpool = await t.context.carpoolRepository.register(insertableCarpool);
  t.context.carpool_id = carpool._id;
});

test.after.always(async (t) => {
  await after(t.context.db);
});

test.serial('Should save create request', async (t) => {
  const data = { ...insertableCarpoolCreateRequest, carpool_id: t.context.carpool_id };

  await t.context.repository.save(data);
  const result = await t.context.db.connection.getClient().query(sql`
    SELECT carpool_id, operator_id, operator_journey_id, api_version, payload FROM ${raw(t.context.repository.table)}
    WHERE carpool_id = ${t.context.carpool_id}
  `);

  t.deepEqual(result.rows.pop(), data);
});

test.serial('Should save cancel request', async (t) => {
  const data = { ...insertableCarpoolCancelRequest, carpool_id: t.context.carpool_id };

  await t.context.repository.save(data);
  const result = await t.context.db.connection.getClient().query(sql`
    SELECT carpool_id, operator_id, operator_journey_id, api_version, cancel_code, cancel_message FROM ${raw(
      t.context.repository.table,
    )}
    WHERE carpool_id = ${t.context.carpool_id} ORDER BY created_at DESC
  `);
  t.deepEqual(result.rows.pop(), data);
});
