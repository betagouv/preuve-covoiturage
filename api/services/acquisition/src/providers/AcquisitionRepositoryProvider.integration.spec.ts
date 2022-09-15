import anyTest, { TestFn } from 'ava';
import { makeDbBeforeAfter, DbContext } from '@pdc/helper-test';
import { AcquisitionRepositoryProvider } from './AcquisitionRepositoryProvider';
import {
  AcquisitionCreateInterface,
  AcquisitionErrorStageEnum,
  AcquisitionStatusEnum,
} from '../interfaces/AcquisitionRepositoryProviderInterface';

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
    payload: {},
    ...data,
  };
}

test.serial('Should create acquisition', async (t) => {
  const { operator_id } = t.context;
  const data = [
    { operator_journey_id: '1' },
    { operator_journey_id: '2' },
    { operator_journey_id: '3' },
    { operator_journey_id: '4' },
  ].map(createPayload);

  const acqs = await t.context.repository.createOrUpdateMany(data);
  t.deepEqual(acqs.map((v) => v.operator_journey_id).sort(), ['1', '2', '3', '4']);

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
    `,
    values: [operator_id],
  });

  t.is(result.rowCount, data.length);
  t.log(result.rows);
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
  const initialData = [{ operator_journey_id: '3' }, { operator_journey_id: '4' }].map(createPayload);
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
      WHERE operator_id = $1 ORDER BY journey_id
    `,
    values: [operator_id],
  });

  t.is(result.rowCount, 4);
  t.log(result.rows);
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
      errors: {
        arbitrary: 'data',
      },
    },
  ]);
  const result = await t.context.db.connection.getClient().query({
    text: `
      SELECT
        operator_id,
        journey_id as operator_journey_id,
        status,
        error_stage,
        errors
      FROM ${t.context.repository.table}
      WHERE operator_id = $1 ORDER BY journey_id
    `,
    values: [operator_id],
  });

  t.is(result.rowCount, 4);
  t.log(result.rows);
  t.deepEqual(result.rows, [
    {
      operator_id: 1,
      operator_journey_id: '1',
      status: 'error',
      error_stage: 'acquisition',
      errors: { arbitrary: 'data' },
    },
    { operator_id: 1, operator_journey_id: '2', status: 'ok', error_stage: null, errors: null },
    { operator_id: 1, operator_journey_id: '3', status: 'pending', error_stage: null, errors: null },
    { operator_id: 1, operator_journey_id: '4', status: 'pending', error_stage: null, errors: null },
  ]);
});

test.serial('Should get status by _id', async (t) => {
  const { operator_id } = t.context;
  const { rows: data } = await t.context.db.connection.getClient().query<{ _id: number }>({
    text: `SELECT _id FROM ${t.context.repository.table} WHERE operator_id = $1 AND journey_id = $2`,
    values: [operator_id, '1'],
  });

  const { operator_journey_id, status, errors, error_stage } = await t.context.repository.getStatus({
    acquisition_id: data[0]._id,
  });

  t.deepEqual(
    { operator_journey_id, status, errors, error_stage },
    {
      operator_journey_id: '1',
      status: AcquisitionStatusEnum.Error,
      errors: { arbitrary: 'data' },
      error_stage: AcquisitionErrorStageEnum.Acquisition,
    },
  );

  // TODO: need carpool seed
  // const r2 = await t.context.repository.getStatus({ operator_id, operator_journey_id: '2' });
  // t.deepEqual(r2.status, AcquisitionStatusEnum.Ok);
});

test.serial('Should get status by operator_id and operator_journey_id', async (t) => {
  const { operator_id } = t.context;
  const { operator_journey_id, status, errors, error_stage } = await t.context.repository.getStatus({
    operator_id,
    operator_journey_id: '1',
  });

  t.deepEqual(
    { operator_journey_id, status, errors, error_stage },
    {
      operator_journey_id: '1',
      status: AcquisitionStatusEnum.Error,
      errors: { arbitrary: 'data' },
      error_stage: AcquisitionErrorStageEnum.Acquisition,
    },
  );
});

test.serial('Should find with date selectors', async (t) => {
  const [result, fn] = await t.context.repository.findThenUpdate({
    limit: 2,
    status: AcquisitionStatusEnum.Pending,
    from: new Date(),
  });

  t.deepEqual(result, []);
  await fn([]);
});

test.serial('Should find then update with selectors', async (t) => {
  const [result, fn] = await t.context.repository.findThenUpdate({
    limit: 2,
    status: AcquisitionStatusEnum.Pending,
    to: new Date(),
  });

  t.deepEqual(
    result.map(({ created_at, ...r }) => r),
    [
      { _id: 3, payload: {}, api_version: 1, operator_id: t.context.operator_id },
      { _id: 4, payload: {}, api_version: 1, operator_id: t.context.operator_id },
    ],
  );
  await fn([]);
});

test.serial('Should find and update with lock', async (t) => {
  const [result1, fn1] = await t.context.repository.findThenUpdate({
    limit: 1,
    status: AcquisitionStatusEnum.Pending,
  });

  t.deepEqual(
    result1.map(({ created_at, ...r }) => r),
    [{ _id: 3, payload: {}, api_version: 1, operator_id: t.context.operator_id }],
  );

  const [result2, fn2] = await t.context.repository.findThenUpdate({
    limit: 1,
    status: AcquisitionStatusEnum.Pending,
  });

  t.deepEqual(
    result2.map(({ created_at, ...r }) => r),
    [{ _id: 4, payload: {}, api_version: 1, operator_id: t.context.operator_id }],
  );

  await fn1([]); // release lock 1
  const [result3, fn3] = await t.context.repository.findThenUpdate({
    limit: 1,
    status: AcquisitionStatusEnum.Pending,
  });

  t.deepEqual(
    result3.map(({ created_at, ...r }) => r),
    [{ _id: 3, payload: {}, api_version: 1, operator_id: t.context.operator_id }],
  );
  await fn2([{ acquisition_id: 4, status: AcquisitionStatusEnum.Ok }]); // release lock 2

  const [result4, fn4] = await t.context.repository.findThenUpdate({
    limit: 1,
    status: AcquisitionStatusEnum.Pending,
  });

  t.deepEqual(result4, []);
  await fn3([]); // release lock 3
  await fn4([]); // release lock 3
});

test.serial('Should find with lock timeout', async (t) => {
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const { operator_id } = t.context;
  await t.context.db.connection.getClient().query({
    text: `UPDATE ${t.context.repository.table} SET status = 'pending' WHERE operator_id = $1`,
    values: [operator_id],
  });

  const [result1, fn1] = await t.context.repository.findThenUpdate(
    {
      limit: 1,
      status: AcquisitionStatusEnum.Pending,
    },
    1000,
  );

  t.deepEqual(
    result1.map(({ created_at, ...r }) => r),
    [{ _id: 1, payload: {}, api_version: 1, operator_id: t.context.operator_id }],
  );

  await delay(1500);

  const [result2, fn2] = await t.context.repository.findThenUpdate({
    limit: 1,
    status: AcquisitionStatusEnum.Pending,
  });

  t.deepEqual(
    result2.map(({ created_at, ...r }) => r),
    [{ _id: 1, payload: {}, api_version: 1, operator_id: t.context.operator_id }],
  );

  await fn1([]); // release lock 1
  await fn2([]); // release lock 2
});

test.serial('Should rollback if update error', async (t) => {
  const [result1, fn1] = await t.context.repository.findThenUpdate(
    {
      limit: 1,
      status: AcquisitionStatusEnum.Pending,
    },
    1000,
  );

  await t.throwsAsync(async () => {
    await fn1(
      result1.map((r) => {
        return {
          acquisition_id: r._id,
          status: 'status_not_existing' as AcquisitionStatusEnum,
        };
      }),
    ); // release lock 1
  });
});

test.serial('Should rollback if find error', async (t) => {
  await t.throwsAsync(async () => {
    await t.context.repository.findThenUpdate(
      {
        limit: 'wrong' as unknown as number,
        status: AcquisitionStatusEnum.Pending,
      },
      1000,
    );
  });
});
