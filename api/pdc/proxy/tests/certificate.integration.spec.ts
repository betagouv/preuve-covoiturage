/**
 * Test certificate creation for the operators.
 * - generate a certificate
 * - download the PDF
 * - download the PNG
 */

import { get } from 'lodash';
import supertest from 'supertest';
import anyTest, { TestFn } from 'ava';

import { KernelInterface, TransportInterface } from '@ilos/common';
import { CryptoProvider } from '@pdc/provider-crypto';
import { TokenProvider } from '@pdc/provider-token';
import { Kernel } from '../Kernel';

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

// create a test to configure the 'after' hook
// this must be done before using the macro to make sure this hook
// runs before the one from the macro
const test = anyTest as TestFn<ContextType>;
// const config = getDbMacroConfig();
// process.env.APP_POSTGRES_URL = config.tmpConnectionString;

test.before.skip(async (t) => {
  // t.context.db = await dbBeforeMacro(config);
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
test.after.always.skip(async (t) => {
  // shutdown app and connections
  await t.context.app.down();
  await t.context.kernel.shutdown();
  // await dbAfterMacro(t.context.db);
});

test.serial.skip('Generate a certificate', async (t) => {
  const response = await t.context.request
    .post(`/v3/certificates`)
    .send({
      identity: { phone: '+33612345670' },
    })
    .set('Accept', 'application/json')
    .set('Content-type', 'application/json')
    .set('Authorization', `Bearer ${t.context.auth}`);
  t.is(response.status, 201);
});

test.serial.skip('Download the certificate', async (t) => {
  // create the certificate
  const createResponse = await t.context.request
    .post(`/v3/certificates`)
    .send({
      identity: { phone: '+33612345670' },
    })
    .set('Accept', 'application/json')
    .set('Content-type', 'application/json')
    .set('Authorization', `Bearer ${t.context.auth}`);
  t.is(createResponse.status, 201);
  const certificate: { uuid: string } = get(createResponse, 'body.result.data', {});

  // download it
  // !!! works only inside docker. first, up all container, then exec inside and test
  const response = await t.context.request
    .get(`/v3/certificates/download/${certificate.uuid}`)
    .set('Accept', 'application/pdf')
    .set('Content-type', 'application/json')
    .set('Authorization', `Bearer ${t.context.auth}`);
  t.is(response.status, 200);
});
