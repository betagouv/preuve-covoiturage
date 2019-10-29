import path from 'path';
import chai from 'chai';
import supertest from 'supertest';
import { describe } from 'mocha';

import { TokenProvider } from '@pdc/provider-token';

import { HttpTransport } from '../src/HttpTransport';
import { Kernel } from '../src/Kernel';
import { requestJourney } from './mocks/requestJourneyV2';

const { expect } = chai;

describe('Send journey using application token', () => {
  const kernel = new Kernel();
  const app = new HttpTransport(kernel);
  let request;
  let token;
  let operator;
  let application;

  const tokenProvider = new TokenProvider().init({ ttl: -1 });

  before(async () => {
    process.env.APP_MONGO_DB = `pdc-test-server-${new Date().getTime()}`;
    const configDir = process.env.APP_CONFIG_DIR ? process.env.APP_CONFIG_DIR : './config';
    process.env.APP_CONFIG_DIR = path.join('..', 'dist', configDir);

    await kernel.bootstrap();
    await app.up(['0']);

    request = supertest(app.app);

    operator = await kernel.call(
      'operator:create',
      {
        nom_commercial: 'Maxi covoit',
        raison_sociale: 'Maxi covoit inc.',
      },
      {
        call: { user: { permissions: ['operator.create'] } },
        channel: {
          service: 'operator',
          transport: 'http',
        },
      },
    );

    application = await kernel.call(
      'application:create',
      {
        name: 'Application',
        operator_id: operator._id.toString(),
        permissions: ['journey.create'],
      },
      {
        call: {
          user: { permissions: ['application.create'] },
        },
        channel: {
          service: 'application',
          transport: 'http',
        },
      },
    );

    token = await tokenProvider.sign({
      a: application._id.toString(),
      o: application.operator_id,
      p: application.permissions,
      v: 2,
    });
  });

  after(async () => {
    await app.down();
  });

  it('REST', async () => {
    return request
      .post('/journeys/push')
      .send(requestJourney)
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('sha256');
        expect(response.body).to.have.property('payload');
        expect(response.body.payload).to.have.property('data');
        expect(response.body.payload.data).to.have.property('result');
        expect(response.body.payload.data.result).to.have.property('operator_id', application.operator_id);
      });
  });

  it('RPC', async () => {
    return request
      .post('/rpc')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'acquisition:create',
        params: {
          params: requestJourney,
        },
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-type', 'application/json')
      .expect((response: supertest.Response) => {
        // TODO detect error
        // console.log(response.body);
        // expect(response.status).to.eq(200);
        // expect(response.body).to.have.property('sha256');
        // expect(response.body).to.have.property('payload');
        // expect(response.body.payload).to.have.property('data');
        // expect(response.body.payload.data).to.have.property('result');
        // expect(response.body.payload.data.result).to.have.property('operator_id', application.operator_id);
      });
  });
});
