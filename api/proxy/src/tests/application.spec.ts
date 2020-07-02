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

import { get } from 'lodash';
import supertest from 'supertest';
import anyTest, { TestInterface } from 'ava';

import { KernelInterface, TransportInterface } from '@ilos/common';
import { CryptoProvider } from '@pdc/provider-crypto';
import { TokenProvider } from '@pdc/provider-token';
import { dbTestMacro, getDbConfig } from '@pdc/helper-test';
import { RedisConnection } from '@ilos/connection-redis';

import { HttpTransport } from '../HttpTransport';
import { MockJWTConfigProvider } from './mocks/MockJWTConfigProvider';

interface ContextType {
  kernel: KernelInterface;
  app: TransportInterface;
  request: any;
  redis: RedisConnection;
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

// super hackish way to change the connectionString before the Kernel is loaded
const { pgConnectionString, database, tmpConnectionString } = getDbConfig();
process.env.APP_POSTGRES_URL = tmpConnectionString;
import { Kernel } from '../Kernel';
import { payloadV2 } from './mocks/payloadV2';

// create a test to configure the 'after' hook
// this must be done before using the macro to make sure this hook
// runs before the one from the macro
const myTest = anyTest as TestInterface<ContextType>;
myTest.after.always(async (t) => {
  // clean up the stuff from the queues
  await t.context.redis.getClient().flushall();

  // shutdown app and connections
  await t.context.app.down();
  await t.context.kernel.shutdown();
});

const { test } = dbTestMacro<ContextType>(myTest, {
  database,
  pgConnectionString,
});

test.before(async (t) => {
  t.context.redis = new RedisConnection({
    connectionString: process.env.APP_REDIS_URL,
  });
  await t.context.redis.up();

  t.context.crypto = new CryptoProvider();
  t.context.token = new TokenProvider(new MockJWTConfigProvider());
  await t.context.token.init();

  t.context.kernel = new Kernel();
  t.context.app = new HttpTransport(t.context.kernel);

  // see @pdc/helper-test README.md
  t.context.application = {
    _id: 1,
    uuid: '1efacd36-a85b-47b2-99df-cabbf74202b3',
    owner_id: 1,
    owner_service: 'operator',
    permissions: [
      'journey.create',
      'certificate.create',
      'certificate.download',
      'certificate.create',
      'certificate.download',
    ],
  };

  await t.context.kernel.bootstrap();
  await t.context.app.up(['0']);
  t.context.request = supertest(t.context.app.getInstance());
});

// test.beforeEach(async (t) => {
//   // login with the operator admin
//   t.context.cookies = await cookieLoginHelper(t.context.request, 'maxicovoit.admin@example.com', 'admin1234');
// });

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
        o: 1,
        s: 'operator',
        p: ['journey.create', 'certificate.create', 'certificate.download'],
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
        o: '1',
        s: 'operator',
        p: ['journey.create', 'certificate.create', 'certificate.download'],
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
        o: 1,
        s: 'operator',
        p: ['journey.create', 'certificate.create', 'certificate.download'],
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
        p: ['journey.create', 'certificate.create', 'certificate.download'],
        v: 2,
      })}`,
    )
    .expect((response: supertest.Response) => {
      t.is(response.status, 403);
      t.is(get(response, 'body.error.message', ''), 'Forbidden Error');
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
        o: 1,
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

test('Deleted application', async (t) => {
  const pl = payloadV2();
  const uuid = '71c3c3d8-208f-455e-9c08-6ea2d48abf69';

  // soft-delete the application
  await t.context.pool.query({
    text: `UPDATE application.applications SET deleted_at = NOW() WHERE uuid = $1`,
    values: [uuid],
  });

  // send a payload
  await t.context.request
    .post(`/v2/journeys`)
    .send(pl)
    .set('Accept', 'application/json')
    .set('Content-type', 'application/json')
    .set(
      'Authorization',
      `Bearer ${await t.context.token.sign({
        a: uuid, // use the other application
        o: 2,
        s: 'operator',
        p: ['journey.create', 'certificate.create', 'certificate.download'],
        v: 2,
      })}`,
    )
    .expect((response: supertest.Response) => {
      t.is(response.status, 401);
      t.is(get(response, 'body.error.message', ''), 'Unauthorized Error');
    });

  // un-soft-delete the application
  await t.context.pool.query({
    text: `UPDATE application.applications SET deleted_at = NULL WHERE uuid = $1`,
    values: [uuid],
  });
});
