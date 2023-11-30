import { NotFoundException } from '@ilos/common';
import { Carpool } from '@pdc/helper-seed/src/carpools';
import { DbContext, makeDbBeforeAfter } from '@pdc/helper-test';
import anyTest, { TestFn } from 'ava';
import { subDays } from 'date-fns';
import {
  AcquisitionCreateInterface,
  AcquisitionErrorStageEnum,
  AcquisitionStatusEnum,
} from '../interfaces/AcquisitionRepositoryProviderInterface';
import { StatusEnum } from '../shared/acquisition/status.contract';
import { AcquisitionRepositoryProvider } from './AcquisitionRepositoryProvider';

interface TestContext {
  repository: AcquisitionRepositoryProvider;
  operator_id: number;
  db: DbContext;
}

const test = anyTest as TestFn<TestContext>;
const { before, after } = makeDbBeforeAfter();

test.before(async (t) => {
  t.context.operator_id = 1;
  const db = await before();
  t.context.db = db;
  t.context.repository = new AcquisitionRepositoryProvider(t.context.db.connection);
});

test.after.always(async (t) => {
  await after(t.context.db);
});

function createPayload(data: Partial<AcquisitionCreateInterface>): AcquisitionCreateInterface {
  return {
    operator_id: 1,
    operator_journey_id: 'one',
    application_id: 1,
    api_version: 1,
    request_id: 'my request id',
    payload: {
      test: '12345',
    },
    ...data,
  };
}

const statusError = new Error('message');
const errors = JSON.parse(JSON.stringify([statusError, statusError, statusError]));

test.serial('Should create acquisition', async (t) => {
  const { operator_id } = t.context;
  const data = [
    { operator_journey_id: '1' }, // pending -> pending (updated) -> acquisition_error
    { operator_journey_id: '2' }, // pending -> ok
    { operator_journey_id: '3' }, // pending -> ok
    { operator_journey_id: '4' }, // pending -> ok
    { operator_journey_id: '5' }, // pending -> fraudcheck_error
  ].map(createPayload);

  const acqs = await t.context.repository.createOrUpdateMany(data);
  t.deepEqual(acqs.map((v) => v.operator_journey_id).sort(), ['1', '2', '3', '4', '5']);

  const result = await t.context.db.connection.getClient().query({
    text: `
      SELECT
        operator_id,
        journey_id as operator_journey_id,
        application_id, api_version,
        request_id,
        payload,
        status,
        try_count
      FROM ${t.context.repository.table}
      WHERE operator_id = $1
      AND request_id IS NOT NULL
    `,
    values: [operator_id],
  });

  t.is(result.rowCount, data.length);
  t.deepEqual(
    result.rows,
    data.map((d) => ({ ...d, status: 'pending', try_count: 0 })),
  );
});

test.serial('Should update acquisition', async (t) => {
  const { operator_id } = t.context;
  await t.context.db.connection.getClient().query({
    text: `
      UPDATE ${t.context.repository.table}
      SET status = 'ok', try_count = 50
      WHERE operator_id = $1 AND journey_id = $2
    `,
    values: [operator_id, '2'],
  });
  const initialData = [{ operator_journey_id: '3' }, { operator_journey_id: '4' }, { operator_journey_id: '5' }].map(
    createPayload,
  );
  const data = [
    { operator_journey_id: '1', request_id: 'other request id' },
    { operator_journey_id: '2', request_id: 'other request id' },
  ].map(createPayload);

  // 2 is not update because 'ok' status
  const acqs = await t.context.repository.createOrUpdateMany(data);
  t.deepEqual(
    acqs.map((v) => v.operator_journey_id),
    ['1'],
  );

  const result = await t.context.db.connection.getClient().query({
    text: `
      SELECT
        operator_id,
        journey_id as operator_journey_id,
        application_id,
        api_version,
        request_id,
        payload,
        status,
        try_count
      FROM ${t.context.repository.table}
      WHERE operator_id = $1
      AND request_id IS NOT NULL
      ORDER BY journey_id
    `,
    values: [operator_id],
  });

  t.is(result.rowCount, 5);
  t.deepEqual(
    result.rows,
    [...data, ...initialData].map((d) => {
      if (d.operator_journey_id !== '2') return { ...d, status: 'pending', try_count: 0 };
      return { ...d, request_id: 'my request id', status: 'ok', try_count: 50 };
    }),
  );
});

test.serial('Should update status', async (t) => {
  const { operator_id } = t.context;
  const { rows: data } = await t.context.db.connection.getClient().query<{ _id: number }>({
    text: `SELECT _id FROM ${t.context.repository.table} WHERE operator_id = $1 AND journey_id = $2`,
    values: [operator_id, '1'],
  });

  await t.context.repository.updateManyStatus([
    {
      acquisition_id: data[0]._id,
      status: AcquisitionStatusEnum.Error,
      error_stage: AcquisitionErrorStageEnum.Acquisition,
      errors: [statusError],
    },
  ]);
  const result = await t.context.db.connection.getClient().query({
    text: `
      SELECT
        operator_id,
        journey_id as operator_journey_id,
        status,
        error_stage,
        errors,
        try_count
      FROM ${t.context.repository.table}
      WHERE operator_id = $1
      AND request_id IS NOT NULL
      ORDER BY journey_id
    `,
    values: [operator_id],
  });

  t.is(result.rowCount, 5);
  t.deepEqual(result.rows, [
    {
      operator_id: 1,
      operator_journey_id: '1',
      status: 'error',
      error_stage: 'acquisition',
      errors: JSON.parse(JSON.stringify([statusError])),
      try_count: 1,
    },
    { operator_id: 1, operator_journey_id: '2', status: 'ok', error_stage: null, errors: [], try_count: 50 },
    { operator_id: 1, operator_journey_id: '3', status: 'pending', error_stage: null, errors: [], try_count: 0 },
    { operator_id: 1, operator_journey_id: '4', status: 'pending', error_stage: null, errors: [], try_count: 0 },
    { operator_id: 1, operator_journey_id: '5', status: 'pending', error_stage: null, errors: [], try_count: 0 },
  ]);

  await t.context.repository.updateManyStatus([
    {
      acquisition_id: data[0]._id,
      status: AcquisitionStatusEnum.Error,
      error_stage: AcquisitionErrorStageEnum.Acquisition,
      errors: [statusError, statusError],
    },
  ]);
  const result2 = await t.context.db.connection.getClient().query({
    text: `
      SELECT
        operator_id,
        journey_id as operator_journey_id,
        status,
        error_stage,
        errors,
        try_count
      FROM ${t.context.repository.table}
      WHERE _id = $1
    `,
    values: [data[0]._id],
  });
  t.deepEqual(result2.rows, [
    {
      errors,
      operator_id: 1,
      operator_journey_id: '1',
      status: 'error',
      error_stage: 'acquisition',
      try_count: 2,
    },
  ]);
});

test.serial('Should get status by operator_id and operator_journey_id', async (t) => {
  const { operator_id } = t.context;
  const { operator_journey_id, status, fraud_error_labels } = await t.context.repository.getStatus(operator_id, '1');

  t.deepEqual(
    { operator_journey_id, status, fraud_error_labels },
    {
      operator_journey_id: '1',
      status: StatusEnum.AcquisitionError,
      fraud_error_labels: [],
    },
  );
});

test.serial('Should get fraudcheck status and labels for carpool', async (t) => {
  // Arrange
  const acquisition_row = await updateAcquistionJourneyIdOk(t.context, '5');
  const { _id: carpool_id } = await insertCarpoolWithStatus(t.context, acquisition_row, 'fraudcheck_error');
  await t.context.db.connection.getClient().query({
    text: `
    INSERT INTO fraudcheck.labels(
      carpool_id, label, geo_code)
      VALUES ($1, $2, $3);
    `,
    values: [carpool_id, 'interoperator_fraud', '76'],
  });

  // Act
  const { status, fraud_error_labels } = await t.context.repository.getStatus(t.context.operator_id, '5');

  // Assert
  t.deepEqual(status, StatusEnum.FraudError);
  t.deepEqual(fraud_error_labels, ['interoperator_fraud']);
});

test.serial('Should find with date selectors', async (t) => {
  const [result, , commit] = await t.context.repository.findThenUpdate({
    limit: 2,
    status: AcquisitionStatusEnum.Pending,
    from: new Date(),
  });

  t.deepEqual(result, []);
  await commit();
});

test.serial('Should find then update with selectors', async (t) => {
  const [result, , commit] = await t.context.repository.findThenUpdate({
    limit: 2,
    status: AcquisitionStatusEnum.Pending,
    to: new Date(),
  });

  t.deepEqual(
    result.map(({ created_at, ...r }) => r),
    [
      { _id: 6, payload: { test: '12345' }, api_version: 1, operator_id: t.context.operator_id },
      { _id: 7, payload: { test: '12345' }, api_version: 1, operator_id: t.context.operator_id },
    ],
  );

  await commit();
});

test.serial('Should find and update with lock', async (t) => {
  const [result1, , commit1] = await t.context.repository.findThenUpdate({
    limit: 1,
    status: AcquisitionStatusEnum.Pending,
  });

  t.deepEqual(
    result1.map(({ created_at, ...r }) => r),
    [{ _id: 6, payload: { test: '12345' }, api_version: 1, operator_id: t.context.operator_id }],
  );

  const [result2, update2, commit2] = await t.context.repository.findThenUpdate({
    limit: 1,
    status: AcquisitionStatusEnum.Pending,
  });

  t.deepEqual(
    result2.map(({ created_at, ...r }) => r),
    [{ _id: 7, payload: { test: '12345' }, api_version: 1, operator_id: t.context.operator_id }],
  );

  await commit1(); // release lock 1
  const [result3, , commit3] = await t.context.repository.findThenUpdate({
    limit: 1,
    status: AcquisitionStatusEnum.Pending,
  });

  t.deepEqual(
    result3.map(({ created_at, ...r }) => r),
    [{ _id: 6, payload: { test: '12345' }, api_version: 1, operator_id: t.context.operator_id }],
  );
  await update2({ acquisition_id: 7, status: AcquisitionStatusEnum.Ok }); // <-- error
  await update2({ acquisition_id: 8, status: AcquisitionStatusEnum.Ok });
  await commit2();
  // release lock 2

  const [result4, , commit4] = await t.context.repository.findThenUpdate({
    limit: 1,
    status: AcquisitionStatusEnum.Pending,
  });

  t.deepEqual(result4, []);
  await commit3(); // release lock 3
  await commit4(); // release lock 3
});

test.serial('Should find with lock timeout', async (t) => {
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const { operator_id } = t.context;
  await t.context.db.connection.getClient().query({
    text: `UPDATE ${t.context.repository.table} SET status = 'pending' WHERE operator_id = $1 AND status <> 'error'`,
    values: [operator_id],
  });

  const [result1, , commit1] = await t.context.repository.findThenUpdate({
    limit: 1,
    status: AcquisitionStatusEnum.Pending,
  });

  t.deepEqual(
    result1.map(({ created_at, ...r }) => r),
    [{ _id: 1, payload: {}, api_version: 2, operator_id: t.context.operator_id }],
  );

  // do the job of the timeout releasing the lock
  // since the timeout has been moved to ProcessJourneyAction,
  // we cannot test it within the AcquisitionRepositoryProvider
  setTimeout(async () => await commit1(), 1000);

  // wait a bit longer and make sure we get the same record from db
  // as it has been unlocked
  // If the record is still locked, we should get _id: 2
  await delay(1500);

  const [result2, , commit2] = await t.context.repository.findThenUpdate({
    limit: 1,
    status: AcquisitionStatusEnum.Pending,
  });

  t.deepEqual(
    result2.map(({ created_at, ...r }) => r),
    [{ _id: 1, payload: {}, api_version: 2, operator_id: t.context.operator_id }],
  );

  await commit2(); // release lock 2
});

// FIXME
// Les callbacks ne sont pas exec dans le scope du catch
// Les erreurs ne sont pas captées et le ROLLBACK
// ne doit pas fonctionner avec le code actuel
test.serial('Should partial rollback if update error', async (t) => {
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const [result1, update1, commit1] = await t.context.repository.findThenUpdate({
    limit: 2,
    status: AcquisitionStatusEnum.Pending,
  });
  await update1({
    acquisition_id: result1[0]._id,
    status: AcquisitionStatusEnum.Ok,
  });
  await update1({
    acquisition_id: result1[1]._id,
    status: 'status_not_existing' as AcquisitionStatusEnum,
  });

  // see above why we mock the timeout
  setTimeout(async () => await commit1(), 1000);
  await delay(1500);

  const { rows: data } = await t.context.db.connection.getClient().query<{ _id: number }>({
    text: `SELECT _id, status FROM ${t.context.repository.table} WHERE _id = ANY($1::int[]) ORDER BY _id`,
    values: [result1.map((r) => r._id)],
  });

  t.deepEqual(data, [
    {
      _id: result1[0]._id,
      status: AcquisitionStatusEnum.Ok,
    },
    {
      _id: result1[1]._id,
      status: AcquisitionStatusEnum.Pending,
    },
  ]);
});

test.serial('Should rollback if find error', async (t) => {
  await t.throwsAsync(async () => {
    await t.context.repository.findThenUpdate({
      limit: 'wrong' as unknown as number,
      status: AcquisitionStatusEnum.Pending,
    });
  });
});

test.serial('Should list acquisition status', async (t) => {
  const search = {
    operator_id: 1,
    status: StatusEnum.Pending,
    start: subDays(new Date(), 7),
    end: new Date(),
    offset: 0,
    limit: 3,
  };

  const result = await t.context.repository.list(search);
  t.deepEqual(result, [{ operator_journey_id: '3' }, { operator_journey_id: '2' }, { operator_journey_id: '5' }]);

  const result1 = await t.context.repository.list({
    ...search,
    status: StatusEnum.AcquisitionError,
  });
  t.deepEqual(result1, [{ operator_journey_id: '1' }]);

  const result2 = await t.context.repository.list({
    ...search,
    status: StatusEnum.Ok,
  });
  t.deepEqual(result2, [
    { operator_journey_id: 'operator_journey_id-2' },
    { operator_journey_id: 'operator_journey_id-1' },
  ]);
});

test.serial('Should cancel acquisition', async (t) => {
  await t.context.repository.cancel(1, '3');
  await t.context.repository.cancel(1, '4', 'CODE1', 'TOTO');
  const result = await t.context.db.connection.getClient().query({
    text: `SELECT
      journey_id as operator_journey_id, cancel_code, cancel_message
    FROM ${t.context.repository.table}
    WHERE operator_id = $1 AND status = 'canceled'
    ORDER BY operator_journey_id`,
    values: [1],
  });
  t.deepEqual(result.rows, [
    {
      operator_journey_id: '3',
      cancel_code: null,
      cancel_message: null,
    },
    {
      operator_journey_id: '4',
      cancel_code: 'CODE1',
      cancel_message: 'TOTO',
    },
  ]);
});

test.serial('Should throw not found if trying to path unexisting acquistion', async (t) => {
  const error1 = await t.throwsAsync(
    async () =>
      await t.context.repository.patchPayload({ operator_id: null, operator_journey_id: undefined, status: [] }, {}),
  );
  t.true(error1 instanceof NotFoundException);

  const error2 = await t.throwsAsync(
    async () =>
      await t.context.repository.patchPayload(
        { operator_id: 1, operator_journey_id: '4', status: [AcquisitionStatusEnum.Ok] },
        {},
      ),
  );
  t.true(error2 instanceof NotFoundException);
});

test.serial('Should patch payload', async (t) => {
  await t.context.repository.patchPayload(
    { operator_id: 1, operator_journey_id: '1', status: [AcquisitionStatusEnum.Error, AcquisitionStatusEnum.Pending] },
    { test2: true },
  );
  const result = await t.context.db.connection.getClient().query({
    text: `SELECT payload
    FROM ${t.context.repository.table}
    WHERE operator_id = $1 AND journey_id = $2
    `,
    values: [1, '1'],
  });
  t.deepEqual(result.rows[0], {
    payload: {
      test: '12345',
      test2: true,
    },
  });
});

test.serial('Should create new acquisition and get anomaly error with temporal overlap label', async (t) => {
  // Arrange
  const data = [{ operator_journey_id: '6' }, { operator_journey_id: '7' }].map(createPayload);

  await t.context.repository.createOrUpdateMany(data);

  // acquisition should be processed and ok
  const acquisition_row_6 = await updateAcquistionJourneyIdOk(t.context, '6');
  const acquisition_row_7 = await updateAcquistionJourneyIdOk(t.context, '7');

  // first is ok is ok second is conflicting
  const { _id: carpool_id_6, operator_journey_id: operator_journey_id_6 } = await insertCarpoolWithStatus(
    t.context,
    acquisition_row_6,
    'ok',
  );
  const { _id: carpool_id_7 } = await insertCarpoolWithStatus(t.context, acquisition_row_7, 'anomaly_error');

  // add anomaly label for carpool_id 7
  await t.context.db.connection.getClient().query({
    text: `
    INSERT INTO anomaly.labels(
      carpool_id, label, conflicting_carpool_id, conflicting_operator_journey_id, overlap_duration_ratio)
      VALUES ($1, $2, $3, $4, $5);
    `,
    values: [carpool_id_7, 'temporal_overlap_anomaly', carpool_id_6, operator_journey_id_6, 0.845],
  });

  // Act
  const { status, anomaly_error_details } = await t.context.repository.getStatus(t.context.operator_id, '7');

  // Assert
  t.deepEqual(status, StatusEnum.AnomalyError);
  t.deepEqual(anomaly_error_details[0].label, 'temporal_overlap_anomaly');
  t.deepEqual(anomaly_error_details[0].metas.conflicting_journey_id, operator_journey_id_6);
  t.deepEqual(anomaly_error_details[0].metas.temporal_overlap_duration_ratio, 0.845);
});

const updateAcquistionJourneyIdOk = async (
  context: TestContext,
  journey_id: string,
): Promise<{ _id: number; journey_id: number }> => {
  const result = await context.db.connection.getClient().query({
    text: `
      UPDATE ${context.repository.table}
      SET status = 'ok'
      WHERE operator_id = $1 AND journey_id = $2
      RETURNING _id, journey_id;
    `,
    values: [context.operator_id, journey_id],
  });
  return result.rows[0];
};

const insertCarpoolWithStatus = async (
  context: TestContext,
  acquisition: { _id: number; journey_id: number },
  status: 'fraudcheck_error' | 'anomaly_error' | 'ok',
): Promise<Carpool & { _id: number }> => {
  const result = await context.db.connection.getClient().query({
    text: `
    INSERT INTO carpool.carpools(
      acquisition_id, operator_id, trip_id, operator_trip_id, is_driver, 
      operator_class, datetime, duration, distance, seats, 
      identity_id, operator_journey_id, cost, status, 
      start_geo_code, end_geo_code)
      VALUES ($1, $2, $3, $4, $5, 
        $6, $7, $8, $9, $10, 
        $11, $12, $13, $14, $15, 
        $16)
      RETURNING _id, operator_journey_id;
    `,
    values: [
      acquisition._id,
      context.operator_id,
      'trip_id_5',
      'operator_trip_id_5',
      true,
      'C',
      new Date(),
      2500,
      25000,
      1,
      4,
      acquisition.journey_id,
      0,
      status,
      '91471',
      '91471',
    ],
  });

  return result.rows[0];
};
