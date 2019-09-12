import path from 'path';
import chai from 'chai';
import supertest from 'supertest';
import { describe } from 'mocha';
import { TokenProvider } from '@pdc/provider-token';
import { QueueTransport } from '@ilos/transport-redis';
import { MongoConnection } from '@ilos/connection-mongo';
import { bootstrap as tripBootstrap } from '@pdc/service-trip';

import { HttpTransport } from '../src/HttpTransport';
import { Kernel } from '../src/Kernel';
import { requestJourney } from './mocks/requestJourneyV2';

const CrosscheckServiceProvider = crosscheckBootstrap.serviceProviders[0];

const { expect } = chai;

class Queue extends QueueTransport {
  async up(opts) {
    await super.up(opts);
  }
}

describe('Acquisition pipeline', () => {
  const kernel = new Kernel();
  const app = new HttpTransport(kernel);
  const worker = new Queue(kernel);
  let request;
  let token;
  let operator;
  let application;

  const tokenProvider = new TokenProvider({
    secret: process.env.APP_JWT_SECRET || 'notsosecret',
    ttl: -1,
  });

  before(async () => {
    process.env.APP_MONGO_DB = `pdc-test-acquisition-${new Date().getTime()}`;
    const configDir = process.env.APP_CONFIG_DIR ? process.env.APP_CONFIG_DIR : './config';
    process.env.APP_CONFIG_DIR = path.join('..', 'dist', configDir);

    await kernel.bootstrap();
    await app.up(['0']);
    await worker.up(['APP_REDIS_URL' in process.env ? process.env.APP_REDIS_URL : 'redis://127.0.0.1:6379']);

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
    await kernel.shutdown();
  });

  it('goes to db', async (done) =>
    request
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
      })
      .then(() => {
        setTimeout(async () => {
          const trips = await kernel
            .get(TripServiceProvider)
            .get(MongoConnection)
            .getClient()
            .db(process.env.APP_MONGO_DB)
            .collection('trips')
            .find()
            .toArray();
          console.log({ trips });
          done();
        }, 2000);
      }));
});
