/**
 * Test application creation for the operators.
 *
 * 3 types of token exist: V1, V2 varchar and V2 integer.
 * We need to make sure legacy versions (V1, V2 varchar) are still compatible.
 *
 * Tested:
 * - operator creation
 * - operator admin login with cookie (/login)
 * - application creation
 * - authorization header use
 * - fake uuid
 * - not matching operator_id and uuid
 * - soft-deleted application
 * - wrong permissions
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
import { payloadV2 } from './mocks/payloadV2';
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
  operatorA: any;
  operatorAUser: any;
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
  t.context.operatorA = await createOperatorFactory(t.context.kernel, {
    name: 'Operator A',
    legal_name: 'Operator A inc.',
    siret: '78017154200027',
  });

  t.context.operators.push(t.context.operatorA._id);

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

    await t.context.pgClient.query('COMMIT');
  } catch (e) {
    t.log(e.message);
    await t.context.pgClient.query('ROLLBACK');
  }

  t.context.pgClient.release();
  await t.context.pg.down();
  await t.context.app.down();
});

/**
 * Applications created MongoDB style with an ObjectID as _id
 *
 */
test('Application V1', async (t) => {
  const pl = payloadV2();

  return t.context.request
    .post(`/v2/journeys`)
    .send(pl)
    .set('Accept', 'application/json')
    .set('Content-type', 'application/json')
    .set(
      'Authorization',
      `Bearer ${await t.context.token.sign({
        id: 'some-string-that-doesnt-get-checked',
        app: t.context.application.uuid,
      })}`,
    )
    .expect((response: supertest.Response) => {
      t.is(response.status, 200);
      t.is(get(response, 'body.result.data.journey_id', ''), pl.journey_id);
    });
});

test('Application V2 integer', async (t) => {
  const pl = payloadV2();

  return t.context.request
    .post(`/v2/journeys`)
    .send(pl)
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
      t.is(get(response, 'body.result.data.journey_id', ''), pl.journey_id);
    });
});

test('Application V2 varchar (old)', async (t) => {
  const pl = payloadV2();

  return t.context.request
    .post(`/v2/journeys`)
    .send(pl)
    .set('Accept', 'application/json')
    .set('Content-type', 'application/json')
    .set(
      'Authorization',
      `Bearer ${await t.context.token.sign({
        a: t.context.application.uuid,
        o: `${t.context.operators[0]}`,
        s: 'operator',
        p: ['journey.create'],
        v: 2,
      })}`,
    )
    .expect((response: supertest.Response) => {
      t.is(response.status, 200);
      t.is(get(response, 'body.result.data.journey_id', ''), pl.journey_id);
    });
});

test('Application Not Found', async (t) => {
  const pl = payloadV2();

  return t.context.request
    .post(`/v2/journeys`)
    .send(pl)
    .set('Accept', 'application/json')
    .set('Content-type', 'application/json')
    .set(
      'Authorization',
      `Bearer ${await t.context.token.sign({
        a: 'not-a-uuid',
        o: t.context.operators[0],
        s: 'operator',
        p: ['journey.create'],
        v: 2,
      })}`,
    )
    .expect((response: supertest.Response) => {
      t.is(response.status, 401);
      t.is(get(response, 'body.error.message', ''), 'Unauthorized Error');
    });
});

test('Wrong operator', async (t) => {
  const pl = payloadV2();

  return t.context.request
    .post(`/v2/journeys`)
    .send(pl)
    .set('Accept', 'application/json')
    .set('Content-type', 'application/json')
    .set(
      'Authorization',
      `Bearer ${await t.context.token.sign({
        a: t.context.application.uuid,
        o: 0,
        s: 'operator',
        p: ['journey.create'],
        v: 2,
      })}`,
    )
    .expect((response: supertest.Response) => {
      t.is(response.status, 403);
      t.is(get(response, 'body.error.message', ''), 'Forbidden Error');
    });
});

test('Deleted application', async (t) => {
  // soft-delete the application
  await t.context.pgClient.query({
    text: `UPDATE application.applications SET deleted_at = NOW() WHERE uuid = $1`,
    values: [t.context.application.uuid],
  });

  const pl = payloadV2();

  await t.context.request
    .post(`/v2/journeys`)
    .send(pl)
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
      t.is(response.status, 401);
      t.is(get(response, 'body.error.message', ''), 'Unauthorized Error');
    });

  // un-soft-delete the application
  await t.context.pgClient.query({
    text: `UPDATE application.applications SET deleted_at = NULL WHERE uuid = $1`,
    values: [t.context.application.uuid],
  });
});

test('Wrong permissions', async (t) => {
  const pl = payloadV2();

  return t.context.request
    .post(`/v2/journeys`)
    .send(pl)
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
      t.is(get(response, 'body.error.message', ''), 'Forbidden Error');
    });
});
