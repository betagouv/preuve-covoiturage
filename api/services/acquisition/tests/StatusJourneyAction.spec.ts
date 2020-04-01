import anyTest, { TestInterface } from 'ava';

import { makeKernel } from '@pdc/helper-test';
import { KernelInterface, NotFoundException } from '@ilos/common';
import { PostgresConnection, PoolClient } from '@ilos/connection-postgres';

import { ServiceProvider } from '../src/ServiceProvider';
import { insertFactory } from './helpers/insertFactory';

const test = anyTest as TestInterface<{
  pg: PostgresConnection;
  pool: PoolClient;
  kernel: KernelInterface;
  journey_id: string;
}>;

const del = {
  acquisitions: [],
  errors: [],
  carpools: [],
};

/**
 * Prepare a kernel with the actions loaded
 * Connect to database
 */
test.before(async (t) => {
  t.context.kernel = makeKernel(ServiceProvider);
  await t.context.kernel.bootstrap();

  t.context.pg = new PostgresConnection({
    connectionString: process.env.APP_POSTGRES_URL,
  });

  t.context.pool = await t.context.pg.getClient().connect();
});

/**
 * Cleanup the database from test entries
 */
test.after.always(async (t) => {
  if (del.acquisitions.length) {
    await t.context.pool.query(`DELETE FROM acquisition.acquisitions WHERE _id IN (${del.acquisitions.join(',')})`);
  }
  if (del.errors.length) {
    await t.context.pool.query(`DELETE FROM acquisition.errors WHERE _id IN (${del.errors.join(',')})`);
  }
  if (del.carpools.length) {
    await t.context.pool.query(`DELETE FROM carpool.carpools WHERE _id IN (${del.carpools.join(',')})`);
  }

  t.context.pool.release();
  await t.context.pg.down();
  await t.context.kernel.shutdown();
});

/**
 * status: pending
 *
 * Journey created in the acquisition.acquisitions table only
 * Behaves as if no workers are running and the journey does not
 * hit the process pipeline towards carpools.
 */
test('status: pending', async (t) => {
  const { insertAcquisition } = insertFactory(t.context.pool);

  const journey_id = `test-${Math.random()}`;
  const operator_id = 999999;

  const acq = await insertAcquisition(journey_id, operator_id);
  del.acquisitions.push(acq._id);

  const response = await t.context.kernel.call(
    'acquisition:status',
    { journey_id },
    {
      call: { user: { operator_id, permissions: ['journey.create'] } },
      channel: { service: 'test' },
    },
  );

  t.deepEqual(response, {
    status: 'pending',
    journey_id,
    created_at: acq.created_at,
  });
});

/**
 * status: ok
 *
 * Journey created in the acquisition.acquisitions table and
 * the carpool.carpooles table with an 'ok' status.
 * Everything went fine through the pipeline.
 */
test('status: ok', async (t) => {
  const { insertAcquisition, insertCarpool } = insertFactory(t.context.pool);

  const journey_id = `test-${Math.random()}`;
  const operator_id = 999999;

  const acq = await insertAcquisition(journey_id, operator_id);
  del.acquisitions.push(acq._id);
  const cp = await insertCarpool(journey_id, acq._id, 'ok', operator_id);
  del.carpools.push(cp._id);

  const response = await t.context.kernel.call(
    'acquisition:status',
    { journey_id },
    {
      call: { user: { operator_id, permissions: ['journey.create'] } },
      channel: { service: 'test' },
    },
  );

  t.deepEqual(response, {
    status: 'ok',
    journey_id,
    created_at: acq.created_at,
  });
});

/**
 * status: expired
 *
 * Journey created in the acquisition.acquisitions table and
 * the carpool.carpooles table with an 'expired' status.
 * Everything went fine through the pipeline but the journey
 * was sent too late by the operator
 */
test('status: expired', async (t) => {
  const { insertAcquisition, insertCarpool } = insertFactory(t.context.pool);

  const journey_id = `test-${Math.random()}`;
  const operator_id = 999999;

  const acq = await insertAcquisition(journey_id, operator_id);
  del.acquisitions.push(acq._id);
  const cp = await insertCarpool(journey_id, acq._id, 'expired', operator_id);
  del.carpools.push(cp._id);

  const response = await t.context.kernel.call(
    'acquisition:status',
    { journey_id },
    {
      call: { user: { operator_id, permissions: ['journey.create'] } },
      channel: { service: 'test' },
    },
  );

  t.deepEqual(response, {
    status: 'expired',
    journey_id,
    created_at: acq.created_at,
  });
});

/**
 * status: canceled
 *
 * Journey created in the acquisition.acquisitions table and
 * the carpool.carpooles table with an 'canceled' status.
 * Everything went fine through the pipeline but the operator
 * canceled the journey for some reason
 */
test('status: canceled', async (t) => {
  const { insertAcquisition, insertCarpool } = insertFactory(t.context.pool);

  const journey_id = `test-${Math.random()}`;
  const operator_id = 999999;

  const acq = await insertAcquisition(journey_id, operator_id);
  del.acquisitions.push(acq._id);
  const cp = await insertCarpool(journey_id, acq._id, 'canceled', operator_id);
  del.carpools.push(cp._id);

  const response = await t.context.kernel.call(
    'acquisition:status',
    { journey_id },
    {
      call: { user: { operator_id, permissions: ['journey.create'] } },
      channel: { service: 'test' },
    },
  );

  t.deepEqual(response, {
    status: 'canceled',
    journey_id,
    created_at: acq.created_at,
  });
});

/**
 * status: not_found
 * Journey does not exist at all
 */
test('status: not_found at all', async (t) => {
  const journey_id = `test-${Math.random()}`;
  const operator_id = 999999;

  await t.throwsAsync(
    () =>
      t.context.kernel.call(
        'acquisition:status',
        { journey_id },
        {
          call: { user: { operator_id, permissions: ['journey.create'] } },
          channel: { service: 'test' },
        },
      ),
    { instanceOf: NotFoundException },
  );
});

/**
 * status: not_found
 *
 * Journey exists but belongs to another operator
 */
test('status: not_found wrong operator_id (acquisition)', async (t) => {
  const { insertAcquisition } = insertFactory(t.context.pool);

  const journey_id = `test-${Math.random()}`;
  const operator_id = 999999;

  const acq = await insertAcquisition(journey_id, operator_id);
  del.acquisitions.push(acq._id);

  await t.throwsAsync(
    () =>
      t.context.kernel.call(
        'acquisition:status',
        { journey_id },
        {
          call: { user: { operator_id: 0, permissions: ['journey.create'] } },
          channel: { service: 'test' },
        },
      ),
    { instanceOf: NotFoundException },
  );
});

/**
 * status: error
 */
test('status: error', async (t) => {
  const { insertError } = insertFactory(t.context.pool);

  const journey_id = `test-${Math.random()}`;
  const operator_id = 999999;

  const err = await insertError(journey_id, operator_id);
  del.errors.push(err._id);

  const response = await t.context.kernel.call(
    'acquisition:status',
    { journey_id },
    {
      call: { user: { operator_id, permissions: ['journey.create'] } },
      channel: { service: 'test' },
    },
  );

  t.deepEqual(response, {
    status: 'error',
    journey_id,
    created_at: err.created_at,
  });
});
