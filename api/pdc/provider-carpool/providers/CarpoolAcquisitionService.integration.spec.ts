import anyTest, { TestFn } from 'ava';
import { makeDbBeforeAfter, DbContext } from '@pdc/provider-test';
import { insertableCarpool, updatableCarpool } from '../mocks/database/carpool';
import { CarpoolAcquisitionService } from './CarpoolAcquisitionService';
import Sinon, { SinonSandbox } from 'sinon';
import { CarpoolEventRepository } from '../repositories/CarpoolEventRepository';
import { CarpoolRequestRepository } from '../repositories/CarpoolRequestRepository';
import { CarpoolLookupRepository } from '../repositories/CarpoolLookupRepository';
import { CarpoolRepository } from '../repositories/CarpoolRepository';
import sql, { raw } from '../helpers/sql';

interface TestContext {
  carpoolRepository: CarpoolRepository;
  eventRepository: CarpoolEventRepository;
  requestRepository: CarpoolRequestRepository;
  lookupRepository: CarpoolLookupRepository;
  db: DbContext;
  sinon: SinonSandbox;
}

const test = anyTest as TestFn<TestContext>;
const { before, after } = makeDbBeforeAfter();

test.before(async (t) => {
  const db = await before();
  t.context.db = db;
  t.context.carpoolRepository = new CarpoolRepository(db.connection);
  t.context.eventRepository = new CarpoolEventRepository(db.connection);
  t.context.requestRepository = new CarpoolRequestRepository(db.connection);
  t.context.lookupRepository = new CarpoolLookupRepository(db.connection);
});

function getService(context: TestContext, overrides: any): CarpoolAcquisitionService {
  return new CarpoolAcquisitionService(
    context.db.connection,
    overrides.eventRepository ?? context.eventRepository,
    overrides.requestRepository ?? context.requestRepository,
    overrides.lookupRepository ?? context.lookupRepository,
    overrides.carpoolRepository ?? context.carpoolRepository,
  );
}

test.after.always(async (t) => {
  await after(t.context.db);
});

test.beforeEach((t) => {
  t.context.sinon = Sinon.createSandbox();
});

test.afterEach((t) => {
  t.context.sinon.restore();
});

test.serial('Should create carpool', async (t) => {
  const carpoolRepository = t.context.sinon.spy(t.context.carpoolRepository);
  const requestRepository = t.context.sinon.spy(t.context.requestRepository);
  const eventRepository = t.context.sinon.spy(t.context.eventRepository);

  const service = getService(t.context, {
    carpoolRepository,
    requestRepository,
    eventRepository,
  });

  const data = { ...insertableCarpool };
  await service.registerRequest({ ...data, api_version: 3 });

  // t.log(carpoolRepository.register.getCalls());
  t.true(carpoolRepository.register.calledOnce);
  // t.log(requestRepository.save.getCalls());
  t.true(requestRepository.save.calledOnce);
  // t.log(eventRepository.saveAcquisitionEvent.getCalls());
  t.true(eventRepository.saveAcquisitionEvent.calledOnce);
  // t.log(eventRepository.syncStatus.getCalls());
  t.true(eventRepository.syncStatus.calledOnce);

  const { _id, created_at, updated_at, ...carpool } = await t.context.lookupRepository.findOne(
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
    acquisition_status: 'received',
  });
});

test.serial('Should update carpool', async (t) => {
  const carpoolRepository = t.context.sinon.spy(t.context.carpoolRepository);
  const requestRepository = t.context.sinon.spy(t.context.requestRepository);
  const eventRepository = t.context.sinon.spy(t.context.eventRepository);

  const service = getService(t.context, {
    carpoolRepository,
    requestRepository,
    eventRepository,
  });

  const data = { ...updatableCarpool };
  await service.updateRequest({
    ...data,
    api_version: 3,
    operator_id: insertableCarpool.operator_id,
    operator_journey_id: insertableCarpool.operator_journey_id,
  });

  // t.log(carpoolRepository.update.getCalls());
  t.true(carpoolRepository.update.calledOnce);
  // t.log(requestRepository.save.getCalls());
  t.true(requestRepository.save.calledOnce);
  // t.log(eventRepository.saveAcquisitionEvent.getCalls());
  t.true(eventRepository.saveAcquisitionEvent.calledOnce);
  // t.log(eventRepository.syncStatus.getCalls());
  t.true(eventRepository.syncStatus.calledOnce);

  const { _id, created_at, updated_at, ...carpool } = await t.context.lookupRepository.findOne(
    insertableCarpool.operator_id,
    insertableCarpool.operator_journey_id,
  );
  t.deepEqual(carpool, {
    ...insertableCarpool,
    ...updatableCarpool,
    incentive_status: 'pending',
    incentive_last_event_id: null,
    fraud_status: 'pending',
    fraud_last_event_id: null,
    acquisition_last_event_id: 2,
    acquisition_status: 'updated',
  });
});

test.serial('Should cancel carpool', async (t) => {
  const lookupRepository = t.context.sinon.spy(t.context.lookupRepository);
  const requestRepository = t.context.sinon.spy(t.context.requestRepository);
  const eventRepository = t.context.sinon.spy(t.context.eventRepository);

  const service = getService(t.context, {
    lookupRepository,
    requestRepository,
    eventRepository,
  });

  const data = {
    cancel_code: 'FRAUD',
    cancel_message: 'Got u',
    api_version: 3,
    operator_id: insertableCarpool.operator_id,
    operator_journey_id: insertableCarpool.operator_journey_id,
  };
  await service.cancelRequest(data);

  // t.log(lookupRepository.findOneStatus.getCalls());
  t.true(lookupRepository.findOneStatus.calledOnce);
  // t.log(requestRepository.save.getCalls());
  t.true(requestRepository.save.calledOnce);
  // t.log(eventRepository.saveAcquisitionEvent.getCalls());
  t.true(eventRepository.saveAcquisitionEvent.calledOnce);
  // t.log(eventRepository.syncStatus.getCalls());
  t.true(eventRepository.syncStatus.calledOnce);

  const { _id, created_at, updated_at, ...carpool } = await t.context.lookupRepository.findOne(
    insertableCarpool.operator_id,
    insertableCarpool.operator_journey_id,
  );
  t.deepEqual(carpool, {
    ...insertableCarpool,
    ...updatableCarpool,
    incentive_status: 'pending',
    incentive_last_event_id: null,
    fraud_status: 'pending',
    fraud_last_event_id: null,
    acquisition_last_event_id: 3,
    acquisition_status: 'canceled',
  });
});

test.serial('Should rollback if something fail', async (t) => {
  const carpoolRepository = t.context.sinon.spy(t.context.carpoolRepository);
  const requestRepository = t.context.sinon.spy(t.context.requestRepository);
  t.context.sinon.replace(t.context.eventRepository, 'syncStatus', t.context.sinon.fake.throws(new Error('DB')));

  const service = getService(t.context, {
    carpoolRepository,
    requestRepository,
  });

  const data = { ...insertableCarpool, operator_journey_id: 'operator_journey_id_2' };
  await t.throwsAsync(async () => await service.registerRequest({ ...data, api_version: 3 }));

  t.true(carpoolRepository.register.calledOnce);
  t.true(requestRepository.save.calledOnce);

  const result = await t.context.db.connection
    .getClient()
    .query(
      sql`SELECT * FROM ${raw(t.context.carpoolRepository.table)} WHERE operator_id = ${
        data.operator_id
      } AND operator_journey_id = ${data.operator_journey_id}`,
    );
  t.deepEqual(result.rows, []);
});
