import chai from 'chai';
import supertest from 'supertest';
import { describe } from 'mocha';

import { TokenProvider } from '@pdc/provider-token';

import { HttpTransport } from '../src/HttpTransport';
import { Kernel } from '../src/Kernel';
import { requestJourney } from './mocks/requestJourneyV2';

process.env.APP_MONGO_DB = 'pdc-test-' + new Date().getTime();

const { expect } = chai;
const kernel = new Kernel();
const app = new HttpTransport(kernel);
let request;
let token;
let operator;
let application;

const tokenProvider = new TokenProvider({
  secret: process.env.APP_JWT_SECRET || 'notsosecret',
  ttl: -1,
});

describe('Send journey using application token', () => {
  before(async () => {
    await kernel.bootstrap();
    await app.up();

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
      appId: application._id.toString(),
      operatorId: application.operator_id,
      permissions: application.permissions,
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
        expect(response.body.payload.data).to.have.property('operator_id', application.operator_id);
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
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('sha256');
        expect(response.body).to.have.property('payload');
        expect(response.body.payload).to.have.property('data');
        expect(response.body.payload.data).to.have.property('result');
        expect(response.body.payload.data.result).to.have.property('operator_id', application.operator_id);
      });
  });
});
