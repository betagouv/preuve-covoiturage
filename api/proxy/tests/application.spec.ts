import anyTest, { TestInterface } from 'ava';
import supertest from 'supertest';
import { get } from 'lodash';

import { PostgresConnection, PoolClient } from '@ilos/connection-postgres';
import { KernelInterface, TransportInterface, ConfigInterface } from '@ilos/common';
import { CryptoProvider } from '@pdc/provider-crypto';
import { TokenProvider } from '@pdc/provider-token';

import { HttpTransport } from '../src/HttpTransport';
import { Kernel } from '../src/Kernel';

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
  operatorB: any;
  operatorAUser: any;
  operatorBUser: any;
  application: any;
  cookies: string;
}

const test = anyTest as TestInterface<ContextType>;

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function payload() {
  return {
    operator_class: 'B',
    journey_id: `test-${getRandomInt(100000000)}`,
    operator_journey_id: 'a65f2757-f960-4abc-a1a1-fd7eca4a04be',
    passenger: {
      distance: 34039,
      duration: 1485,
      incentives: [],
      contribution: 76,
      seats: 1,
      identity: {
        over_18: true,
        phone_trunc: '+337672012',
        operator_user_id: `test-${getRandomInt(100000000)}`,
      },
      start: {
        datetime: '2019-07-10T11:51:07Z',
        lat: 48.77826,
        lon: 2.21223,
      },
      end: {
        datetime: '2019-07-10T12:34:14Z',
        lat: 48.82338,
        lon: 1.78668,
      },
    },
    driver: {
      distance: 34039,
      duration: 1485,
      incentives: [],
      revenue: 376,
      identity: {
        over_18: true,
        phone: '+33783884322',
      },
      start: {
        datetime: '2019-07-10T11:51:07Z',
        lat: 48.77826,
        lon: 2.21223,
      },
      end: {
        datetime: '2019-07-10T12:34:14Z',
        lat: 48.82338,
        lon: 1.78668,
      },
    },
  };
}

class MockConfigProvider implements ConfigInterface {
  get(key: string, fallback?: any) {
    return get(
      {
        jwt: {
          secret: process.env.APP_JWT_SECRET,
          ttl: -1,
          alg: 'HS256',
          signOptions: {},
          verifyOptions: {},
        },
      },
      key,
      fallback,
    );
  }
}

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
  t.context.token = new TokenProvider(new MockConfigProvider());
  await t.context.token.init();

  t.context.kernel = new Kernel();
  t.context.app = new HttpTransport(t.context.kernel);

  await t.context.kernel.bootstrap();
  await t.context.app.up(['0']);
  t.context.request = supertest(t.context.app.getInstance());

  /**
   * Create 2 operators
   */
  t.context.operatorA = await t.context.kernel.call(
    'operator:create',
    {
      name: 'Operator A',
      legal_name: 'Operator A inc.',
      siret: '78017154200027',
    },
    {
      call: { user: { permissions: ['operator.create'] } },
      channel: {
        service: 'operator',
        transport: 'http',
      },
    },
  );

  t.context.operatorB = await t.context.kernel.call(
    'operator:create',
    {
      name: 'Operator B',
      legal_name: 'Operator B inc.',
      siret: '78017154200027',
    },
    {
      call: { user: { permissions: ['operator.create'] } },
      channel: {
        service: 'operator',
        transport: 'http',
      },
    },
  );

  t.context.operators.push(t.context.operatorA._id, t.context.operatorB._id);

  /**
   * Create users for these operators
   */
  await t.context.pgClient.query('BEGIN');
  for (const id of t.context.operators) {
    const user = await t.context.pgClient.query({
      text: `
        INSERT INTO auth.users
        (email, password, firstname, lastname, role, status, operator_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING _id
      `,
      values: [
        `operator_${id}@example.com`,
        await t.context.crypto.cryptPassword('admin1234'),
        `operator ${id}`,
        'Example',
        'operator.admin',
        'active',
        id,
      ],
    });

    t.context.users.push(user.rows[0]._id);
  }

  await t.context.pgClient.query('COMMIT');
});

test.beforeEach(async (t) => {
  // log the operatorUser
  const res = await t.context.request.post('/login').send({
    email: `operator_${t.context.operators[0]}@example.com`,
    password: 'admin1234',
  });
  const re = new RegExp('; path=/; httponly', 'gi');

  // Save the cookie to use it later to retrieve the session
  if (!res.headers['set-cookie']) {
    throw new Error('Failed to set cookie');
  }

  t.context.cookies = res.headers['set-cookie'].map((r: string) => r.replace(re, '')).join('; ');

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
  const pl = payload();

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
  const pl = payload();

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
  const pl = payload();

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
