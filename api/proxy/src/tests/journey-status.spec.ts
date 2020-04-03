/**
 * Test journey status
 *
 * Create an application to mock an operator.
 * 1. Check a 'pending' journey written manually in
 * 2. Check wrong permissions
 * 3. Check wrong journey_id
 * 4. Check wrong operator_id
 */

import anyTest, { TestInterface } from 'ava';
import supertest from 'supertest';
import { get } from 'lodash';

import { PostgresConnection, PoolClient } from '@ilos/connection-postgres';
import { KernelInterface, TransportInterface } from '@ilos/common';
import { CryptoProvider } from '@pdc/provider-crypto';
import { TokenProvider } from '@pdc/provider-token';

import { HttpTransport } from '../HttpTransport';
import { Kernel } from '../Kernel';
import { MockJWTConfigProvider } from './mocks/MockJWTConfigProvider';
import { createOperatorFactory } from './helpers/createOperatorFactory';
import { createOperatorAdminSqlFactory } from './helpers/createUserFactory';
import { cookieLoginHelper } from './helpers/cookieLoginHelper';

interface ContextType {
  kernel: KernelInterface;
  app: TransportInterface;
  request: any;
  pg: PostgresConnection;
  pgClient: PoolClient;
  crypto: CryptoProvider;
  token: TokenProvider;
  applications: number[];
  operators: number[];
  users: number[];
  journeys: number[];
  journey: any;
  operator: any;
  operatorUser: any;
  application: any;
  cookies: string;
}

const test = anyTest as TestInterface<ContextType>;

/**
 * Initialise testing context with connections and fixtures
 * - 2 operators
 * - 1 user for each operator (operator.admin)
 */
test.before(async (t) => {
  t.context.applications = [];
  t.context.operators = [];
  t.context.users = [];
  t.context.journeys = [];

  t.context.pg = new PostgresConnection({ connectionString: process.env.APP_POSTGRES_URL });
  t.context.pgClient = await t.context.pg.getClient().connect();

  t.context.crypto = new CryptoProvider();
  t.context.token = new TokenProvider(new MockJWTConfigProvider());
  await t.context.token.init();

  t.context.kernel = new Kernel();
  t.context.app = new HttpTransport(t.context.kernel);

  await t.context.kernel.bootstrap();
  await t.context.app.up(['0']);
  t.context.request = supertest(t.context.app.getInstance());

  /**
   * Create the operator
   */
  t.context.operator = await createOperatorFactory(t.context.kernel, {
    name: 'Operator A',
    legal_name: 'Operator A inc.',
    siret: '78017154200027',
  });

  t.context.operators.push(t.context.operator._id);

  /**
   * Create users for these operators
   */
  await t.context.pgClient.query('BEGIN');
  for (const id of t.context.operators) {
    const user = await createOperatorAdminSqlFactory(t.context.pgClient, t.context.crypto, id);
    t.context.users.push(user._id);
  }
  await t.context.pgClient.query('COMMIT');
});

test.beforeEach(async (t) => {
  // login with the operator admin
  t.context.cookies = await cookieLoginHelper(
    t.context.request,
    `operator_${t.context.operators[0]}@example.com`,
    'admin1234',
  );

  // create an application
  await t.context.request
    .post(`/applications`)
    .send({ name: 'Application A' })
    .set('Cookie', t.context.cookies)
    .set('Accept', 'application/json')
    .set('Content-type', 'application/json')
    .expect((response: supertest.Response) => {
      t.is(response.status, 201);
      t.is(get(response, 'body.application.name', ''), 'Application A');
      t.is(get(response, 'body.application.owner_id', 0), t.context.operators[0]);
      t.is(get(response, 'body.application.owner_service', ''), 'operator');

      t.context.application = response.body.application;
      t.context.applications.push(response.body.application._id);
    });
});

test.after.always(async (t) => {
  try {
    await t.context.pgClient.query('BEGIN');

    // clean created applications
    if (t.context.applications.length) {
      t.log(`Cleaning up applications (${t.context.applications.join(',')})`);
      await t.context.pgClient.query(
        `DELETE FROM application.applications WHERE _id IN (${t.context.applications.join(',')})`,
      );
    }

    // clean created operators
    if (t.context.operators.length) {
      t.log(`Cleaning up operators (${t.context.operators.join(',')})`);
      await t.context.pgClient.query(`DELETE FROM operator.operators WHERE _id IN (${t.context.operators.join(',')})`);
    }

    // clean created users
    if (t.context.users.length) {
      t.log(`Cleaning up users (${t.context.users.join(',')})`);
      await t.context.pgClient.query(`DELETE FROM auth.users WHERE _id IN (${t.context.users.join(',')})`);
    }

    // clean created users
    if (t.context.journeys.length) {
      t.log(`Cleaning up journeys (${t.context.journeys.join(',')})`);
      await t.context.pgClient.query(
        `DELETE FROM acquisition.acquisitions WHERE _id IN (${t.context.journeys.join(',')})`,
      );
    }

    await t.context.pgClient.query('COMMIT');
  } catch (e) {
    t.log(e.message);
    await t.context.pgClient.query('ROLLBACK');
  }

  t.context.pgClient.release();
  await t.context.pg.down();
  await t.context.app.down();
});

test("Status: check 'pending' journey", async (t) => {
  const journey_id = `test-${Math.random()}`;

  // manually create a journey in database
  const result = await t.context.pgClient.query({
    text: `
    INSERT INTO acquisition.acquisitions
    (application_id, operator_id, journey_id, payload)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `,
    values: [t.context.application._id, t.context.operator._id, journey_id, '{}'],
  });

  t.context.journey = result.rows[0];
  t.context.journeys.push(result.rows[0]._id);

  // check the status
  return t.context.request
    .get(`/v2/journeys/${journey_id}`)
    .set('Accept', 'application/json')
    .set('Content-type', 'application/json')
    .set(
      'Authorization',
      `Bearer ${await t.context.token.sign({
        a: t.context.application.uuid,
        o: t.context.operators[0],
        s: 'operator',
        p: ['journey.create'],
        v: 2,
      })}`,
    )
    .expect((response: supertest.Response) => {
      t.is(response.status, 200);
      t.deepEqual(get(response, 'body.result.data'), {
        status: 'pending',
        journey_id,
        created_at: t.context.journey.created_at.toISOString(),
      });
    });
});

test('Status: check wrong permissions', async (t) => {
  const journey_id = `test-${Math.random()}`;

  // check the status
  return t.context.request
    .get(`/v2/journeys/${journey_id}`)
    .set('Accept', 'application/json')
    .set('Content-type', 'application/json')
    .set(
      'Authorization',
      `Bearer ${await t.context.token.sign({
        a: t.context.application.uuid,
        o: t.context.operators[0],
        s: 'operator',
        p: ['wrong.permission'],
        v: 2,
      })}`,
    )
    .expect((response: supertest.Response) => {
      t.is(response.status, 403);

      // FIX ME with RPC error code
      t.deepEqual(get(response, 'body.error', {}), {
        code: 403,
        data: 'Error',
        message: 'Forbidden Error',
      });
    });
});

test('Status: check wrong journey_id', async (t) => {
  const journey_id = `test-${Math.random()}`;

  // manually create a journey in database
  const result = await t.context.pgClient.query({
    text: `
    INSERT INTO acquisition.acquisitions
    (application_id, operator_id, journey_id, payload)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `,
    values: [t.context.application._id, t.context.operator._id, journey_id, '{}'],
  });

  t.context.journey = result.rows[0];
  t.context.journeys.push(result.rows[0]._id);

  // check the status
  return t.context.request
    .get(`/v2/journeys/${journey_id}-wrong`)
    .set('Accept', 'application/json')
    .set('Content-type', 'application/json')
    .set(
      'Authorization',
      `Bearer ${await t.context.token.sign({
        a: t.context.application.uuid,
        o: t.context.operators[0],
        s: 'operator',
        p: ['journey.create'],
        v: 2,
      })}`,
    )
    .expect((response: supertest.Response) => {
      t.is(response.status, 404);
      t.deepEqual(get(response, 'body.error', {}), {
        code: -32504,
        message: 'Not found',
      });
    });
});

test('Status: check wrong operator_id', async (t) => {
  const journey_id = `test-${Math.random()}`;

  // manually create a journey in database
  const result = await t.context.pgClient.query({
    text: `
    INSERT INTO acquisition.acquisitions
    (application_id, operator_id, journey_id, payload)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `,
    values: [t.context.application._id, t.context.operator._id + 1, journey_id, '{}'],
  });

  t.context.journey = result.rows[0];
  t.context.journeys.push(result.rows[0]._id);

  // check the status
  return t.context.request
    .get(`/v2/journeys/${journey_id}`)
    .set('Accept', 'application/json')
    .set('Content-type', 'application/json')
    .set(
      'Authorization',
      `Bearer ${await t.context.token.sign({
        a: t.context.application.uuid,
        o: t.context.operators[0],
        s: 'operator',
        p: ['journey.create'],
        v: 2,
      })}`,
    )
    .expect((response: supertest.Response) => {
      t.is(response.status, 404);
      t.deepEqual(get(response, 'body.error', {}), {
        code: -32504,
        message: 'Not found',
      });
    });
});
