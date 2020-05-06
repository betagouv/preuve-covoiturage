/**
 * Test certificate creation for the operators.
 * - generate a certificate
 * - download the PDF
 * - download the PNG
 */

import { get } from 'lodash';
import supertest from 'supertest';
import anyTest, { TestInterface } from 'ava';

import { KernelInterface, TransportInterface } from '@ilos/common';
import { CryptoProvider } from '@pdc/provider-crypto';
import { TokenProvider } from '@pdc/provider-token';
import { dbTestMacro, getDbConfig } from '@pdc/helper-test';

import { HttpTransport } from '../HttpTransport';
import { MockJWTConfigProvider } from './mocks/MockJWTConfigProvider';

interface ContextType {
  kernel: KernelInterface;
  app: TransportInterface;
  request: any;
  crypto: CryptoProvider;
  token: TokenProvider;
  auth: string;
}

// super hackish way to change the connectionString before the Kernel is loaded
const { pgConnectionString, database, tmpConnectionString } = getDbConfig();
process.env.APP_POSTGRES_URL = tmpConnectionString;
import { Kernel } from '../Kernel';

// create a test to configure the 'after' hook
// this must be done before using the macro to make sure this hook
// runs before the one from the macro
const myTest = anyTest as TestInterface<ContextType>;
myTest.after.always(async (t) => {
  // shutdown app and connections
  await t.context.app.down();
  await t.context.kernel.shutdown();
});

const { test } = dbTestMacro<ContextType>(myTest, {
  database,
  pgConnectionString,
});

test.before(async (t) => {
  t.context.crypto = new CryptoProvider();
  t.context.token = new TokenProvider(new MockJWTConfigProvider());
  await t.context.token.init();

  t.context.kernel = new Kernel();
  t.context.app = new HttpTransport(t.context.kernel);

  // see @pdc/helper-test README.md
  t.context.auth = await t.context.token.sign({
    a: '1efacd36-a85b-47b2-99df-cabbf74202b3',
    o: 1,
    s: 'operator',
    p: ['journey.create', 'certificate.create', 'certificate.download'],
    v: 2,
  });

  await t.context.kernel.bootstrap();
  await t.context.app.up(['0']);
  t.context.request = supertest(t.context.app.getInstance());
});

test('Generate a certificate', async (t) => {
  return t.context.request
    .post(`/v2/certificates`)
    .send({
      identity: { phone: '+33612345670' },
    })
    .set('Accept', 'application/json')
    .set('Content-type', 'application/json')
    .set('Authorization', `Bearer ${t.context.auth}`)
    .expect((response: supertest.Response) => {
      // console.log(response.status, response.body);
      t.is(response.status, 201);
    });
});

test('Download the certificate', async (t) => {
  let certificate: { uuid: string };

  // create the certificate
  await t.context.request
    .post(`/v2/certificates`)
    .send({
      identity: { phone: '+33612345670' },
    })
    .set('Accept', 'application/json')
    .set('Content-type', 'application/json')
    .set('Authorization', `Bearer ${t.context.auth}`)
    .expect((response: supertest.Response) => {
      // console.log(response.status, response.body);
      t.is(response.status, 201);
      certificate = get(response, 'body.result.data', {});
    });

  // download it
  // !!! works only inside docker. first, up all container, then exec inside and test
  return t.context.request
    .get(`/v2/certificates/download/${certificate.uuid}`)
    .set('Accept', 'application/pdf')
    .set('Content-type', 'application/json')
    .set('Authorization', `Bearer ${t.context.auth}`)
    .expect((response: supertest.Response) => {
      console.log(response.status, response.body);
      t.is(response.status, 200);
    });
});
