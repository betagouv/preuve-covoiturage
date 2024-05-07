import { DbContext, makeDbBeforeAfter } from '@pdc/providers/test';
import anyTest, { TestFn } from 'ava';
import { Id } from '../interfaces';
import { insertableCarpool } from '../mocks/database/carpool';
import { insertableAcquisitionStatus } from '../mocks/database/status';
import { CarpoolLookupRepository } from './CarpoolLookupRepository';
import { CarpoolRepository } from './CarpoolRepository';
import { CarpoolStatusRepository } from './CarpoolStatusRepository';

interface TestContext {
  repository: CarpoolLookupRepository;
  statusRepository: CarpoolStatusRepository;
  carpoolRepository: CarpoolRepository;
  db: DbContext;
  carpool_id: Id;
}

const test = anyTest as TestFn<TestContext>;
const { before, after } = makeDbBeforeAfter();

test.before(async (t) => {
  const db = await before();
  t.context.db = db;
  t.context.repository = new CarpoolLookupRepository(t.context.db.connection);
  t.context.statusRepository = new CarpoolStatusRepository(t.context.db.connection);
  t.context.carpoolRepository = new CarpoolRepository(t.context.db.connection);
  const carpool = await t.context.carpoolRepository.register(insertableCarpool);
  const statusData = { ...insertableAcquisitionStatus, carpool_id: carpool._id };
  await t.context.statusRepository.saveAcquisitionStatus(statusData);
  t.context.carpool_id = carpool._id;
});

test.after.always(async (t) => {
  await after(t.context.db);
});

test.serial('Should get one carpool status', async (t) => {
  const data = { ...insertableCarpool };
  const { _id, acquisition_status, operator_trip_id } = await t.context.repository.findOneStatus(
    data.operator_id,
    data.operator_journey_id,
  );
  t.deepEqual(
    { _id, acquisition_status, operator_trip_id },
    {
      _id: t.context.carpool_id,
      acquisition_status: insertableAcquisitionStatus.status,
      operator_trip_id: data.operator_trip_id,
    },
  );
});

test.serial('Should get one carpool', async (t) => {
  const data = { ...insertableCarpool };
  const { _id, uuid, created_at, updated_at, ...carpool } = await t.context.repository.findOne(
    data.operator_id,
    data.operator_journey_id,
  );
  t.deepEqual(carpool, {
    ...data,
    fraud_status: 'pending',
    acquisition_status: 'canceled',
  });
});
