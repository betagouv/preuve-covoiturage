/**
 * End-to-end tests of the acquisition pipeline
 *
 * We wanna make sure the submitted journey makes it through all steps by
 * running the app and the worker, sending a journey to the REST endpoint
 * before checking the carpool.carpools table after some delay.
 */

import anyTest, { TestInterface } from 'ava';
import supertest from 'supertest';
import { get } from 'lodash';

import { PostgresConnection, PoolClient } from '@ilos/connection-postgres';
import { KernelInterface, TransportInterface } from '@ilos/common';
import { CryptoProvider } from '@pdc/provider-crypto';
import { TokenProvider } from '@pdc/provider-token';
import { QueueTransport } from '@ilos/transport-redis';

import { HttpTransport } from '../src/HttpTransport';
import { Kernel } from '../src/Kernel';
import { payloadV2 } from './mocks/payloadV2';
import { MockJWTConfigProvider } from './mocks/MockJWTConfigProvider';
import { createOperatorFactory } from './helpers/createOperatorFactory';
import { createOperatorAdminSqlFactory } from './helpers/createUserFactory';
import { cookieLoginHelper } from './helpers/cookieLoginHelper';

interface ContextType {
  kernel: KernelInterface;
  app: TransportInterface;
  worker: QueueTransport;
  request: any;
  pg: PostgresConnection;
  pgClient: PoolClient;
  crypto: CryptoProvider;
  token: TokenProvider;
  applications: number[];
  operators: number[];
  users: number[];
  journeys: number[];
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
  t.context.journeys = [];

  t.context.pg = new PostgresConnection({ connectionString: process.env.APP_POSTGRES_URL });
  t.context.pgClient = await t.context.pg.getClient().connect();

  t.context.crypto = new CryptoProvider();
  t.context.token = new TokenProvider(new MockJWTConfigProvider());
  await t.context.token.init();

  t.context.kernel = new Kernel();
  t.context.app = new HttpTransport(t.context.kernel);
  t.context.worker = new QueueTransport(t.context.kernel);

  await t.context.kernel.bootstrap();
  await t.context.app.up(['0']);
  await t.context.worker.up([process.env.APP_REDIS_URL]);
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

    // clean created journeys
    if (t.context.journeys.length) {
      t.log(`Cleaning up journeys (${t.context.journeys.join(',')})`);
      await t.context.pgClient.query(
        `DELETE FROM acquisition.acquisitions WHERE journey_id IN (${t.context.journeys.join(',')})`,
      );
      await t.context.pgClient.query(
        `DELETE FROM carpool.carpools WHERE operator_journey_id IN (${t.context.journeys.join(',')})`,
      );
    }

    await t.context.pgClient.query('COMMIT');
  } catch (e) {
    t.log(e.message);
    await t.context.pgClient.query('ROLLBACK');
  }

  t.context.pgClient.release();
  await t.context.pg.down();
  await t.context.worker.down();
  await t.context.app.down();
});

test.cb('Pipeline check', (t) => {
  const pl = payloadV2();
  const checkInDb = (operator_journey_id: string): Promise<boolean> =>
    new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const result = await t.context.pgClient.query({
            text: 'SELECT operator_journey_id FROM carpool.carpools WHERE operator_journey_id = $1',
            values: [operator_journey_id],
          });

          if (!result.rowCount) throw new Error(`Not found ${operator_journey_id}`);

          resolve(result.rows[0].operator_journey_id);
        } catch (e) {
          console.log('reject');
          reject(e);
        }
      }, 1000);
    });

  t.context.token
    .sign({
      a: t.context.application.uuid,
      o: t.context.operators[0],
      s: 'operator',
      p: ['journey.create'],
      v: 2,
    })
    .then((token) => {
      return t.context.request
        .post(`/v2/journeys`)
        .send(pl)
        .set('Accept', 'application/json')
        .set('Content-type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect((response: supertest.Response) => {
          // make sure the journey has been sent properly
          t.is(response.status, 200);

          const operator_journey_id = get(response, 'body.result.data.journey_id', '');
          t.is(operator_journey_id, pl.journey_id);

          t.context.journeys.push(operator_journey_id);

          checkInDb(operator_journey_id)
            .then((res) => {
              t.is(res, operator_journey_id);
              t.end();
            })
            .catch(t.end);
        });
    })
    .catch(t.end);
});
