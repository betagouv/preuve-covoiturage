import anyTest, { TestFn } from 'ava';
import { makeDbBeforeAfter, DbContext } from '@pdc/helper-test';
import { CarpoolRepository } from './CarpoolRepository';
import { CarpoolEventRepository } from './CarpoolEventRepository';
import { insertableCarpool } from '../mocks/database/carpool';
import { Id } from '../interfaces';
import { insertableAcquisitionEvent } from '../mocks/database/event';
import { CarpoolLookupRepository } from './CarpoolLookupRepository';

interface TestContext {
  repository: CarpoolLookupRepository;
  eventRepository: CarpoolEventRepository;
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
  t.context.eventRepository = new CarpoolEventRepository(t.context.db.connection);
  t.context.carpoolRepository = new CarpoolRepository(t.context.db.connection);
  const carpool = await t.context.carpoolRepository.register(insertableCarpool);
  const eventData = { ...insertableAcquisitionEvent, carpool_id: carpool._id };
  await t.context.eventRepository.saveAcquisitionEvent(eventData);
  await t.context.eventRepository.syncStatus(carpool._id);
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
      acquisition_status: insertableAcquisitionEvent.status,
      operator_trip_id: data.operator_trip_id,
    },
  );
});

test.serial('Should get one carpool', async (t) => {
  const data = { ...insertableCarpool };
  const { _id, created_at, updated_at, ...carpool } = await t.context.repository.findOne(
    data.operator_id,
    data.operator_journey_id,
  );
  t.deepEqual(carpool, {
    ...data,
    incentive_status: 'pending',
    incentive_last_event_id: null,
    fraud_status: 'pending',
    fraud_last_event_id: null,
    acquisition_last_event_id: 1,
    acquisition_status: 'canceled',
  });
});
