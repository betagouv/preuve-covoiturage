/**
 * Test application creation for the operators.
 *
 * 3 types of token exist: V1, v3 varchar and v3 integer.
 * We need to make sure legacy versions (V1, v3 varchar) are still compatible.
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
import anyTest, { TestFn } from 'ava';

import { KernelInterface, TransportInterface } from '@ilos/common';
import { CryptoProvider } from '@pdc/provider-crypto';
import { TokenProvider } from '@pdc/provider-token';
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

import { Kernel } from '../Kernel';
import { payloadv3 } from './mocks/payloadv3';

// create a test to configure the 'after' hook
// this must be done before using the macro to make sure this hook
// runs before the one from the macro
const test = anyTest as TestFn<ContextType>;
// const config = getDbMacroConfig();
// process.env.APP_POSTGRES_URL = config.tmpConnectionString;

test.before(async (t) => {
  // t.context.db = await dbBeforeMacro(config);
  t.context.redis = new RedisConnection({
    connectionString: process.env.APP_REDIS_URL,
  });
  await t.context.redis.up();

  t.context.crypto = new CryptoProvider();
  t.context.token = new TokenProvider(new MockJWTConfigProvider());
  await t.context.token.init();

  t.context.kernel = new Kernel();
  t.context.app = new HttpTransport(t.context.kernel);

  // see @pdc/provider-test README.md
  t.context.application = {
    _id: 1,
    uuid: '1efacd36-a85b-47b2-99df-cabbf74202b3',
    owner_id: 1,
    owner_service: 'operator',
    permissions: [
      // import permissions
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

test.after.always.skip(async (t) => {
  // clean up the stuff from the queues
  await t.context.redis.getClient().flushall();

  // shutdown app and connections
  await t.context.app.down();
  await t.context.kernel.shutdown();
  // await dbAfterMacro(t.context.db);
});

// test.beforeEach(async (t) => {
//   // login with the operator admin
//   t.context.cookies = await cookieLoginHelper(t.context.request, 'maxicovoit.admin@example.com', 'admin1234');
// });

/**
 * Applications created MongoDB style with an ObjectID as _id
 *
 */
test.skip('Application V1', async (t) => {
  const pl = payloadv3();

  const response = await t.context.request
    .post(`/v3/journeys`)
    .send(pl)
    .set('Accept', 'application/json')
    .set('Content-type', 'application/json')
    .set(
      'Authorization',
      `Bearer ${await t.context.token.sign({
        id: 'some-string-that-doesnt-get-checked',
        app: t.context.application.uuid,
      })}`,
    );
  t.is(response.status, 200);
  t.is(get(response, 'body.result.data.journey_id', ''), pl.journey_id);
});

test.skip('Application v3 integer', async (t) => {
  const pl = payloadv3();

  const response = await t.context.request
    .post(`/v3/journeys`)
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
    );
  t.is(response.status, 200);
  t.is(get(response, 'body.result.data.journey_id', ''), pl.journey_id);
});

test.skip('Application v3 varchar (old)', async (t) => {
  const pl = payloadv3();

  const response = await t.context.request
    .post(`/v3/journeys`)
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
    );
  t.is(response.status, 200);
  t.is(get(response, 'body.result.data.journey_id', ''), pl.journey_id);
});

test.skip('Application Not Found', async (t) => {
  const pl = payloadv3();

  const response = await t.context.request
    .post(`/v3/journeys`)
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
    );
  t.is(response.status, 401);
  t.is(get(response, 'body.error.message', ''), 'Unauthorized Error');
});

test.skip('Wrong operator', async (t) => {
  const pl = payloadv3();

  const response = await t.context.request
    .post(`/v3/journeys`)
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
    );
  t.is(response.status, 403);
  t.is(get(response, 'body.error.message', ''), 'Forbidden Error');
});

test.skip('Wrong permissions', async (t) => {
  const pl = payloadv3();

  const response = await t.context.request
    .post(`/v3/journeys`)
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
    );
  t.is(response.status, 403);
  t.is(get(response, 'body.error.message', ''), 'Forbidden Error');
});

test.skip('Deleted application', async (t) => {
  const pl = payloadv3();
  const uuid = '71c3c3d8-208f-455e-9c08-6ea2d48abf69';

  // soft-delete the application
  // await t.context.db.tmpConnection.getClient().query({
  //   text: `UPDATE application.applications SET deleted_at = NOW() WHERE uuid = $1`,
  //   values: [uuid],
  // });

  // send a payload
  const response = await t.context.request
    .post(`/v3/journeys`)
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
    );
  t.is(response.status, 401);
  t.is(get(response, 'body.error.message', ''), 'Unauthorized Error');

  // un-soft-delete the application
  // await t.context.db.tmpConnection.getClient().query({
  //   text: `UPDATE application.applications SET deleted_at = NULL WHERE uuid = $1`,
  //   values: [uuid],
  // });
});
