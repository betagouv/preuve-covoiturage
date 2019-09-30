// tslint:disable: no-unused-expression
import path from 'path';
import chai from 'chai';
import supertest from 'supertest';
import { describe } from 'mocha';
import { QueueTransport } from '@ilos/transport-redis';
import { TripInterface } from '@pdc/provider-schema';

import { HttpTransport } from '../src/HttpTransport';
import { Kernel } from '../src/Kernel';
import { requestJourney } from './mocks/requestJourneyV2';

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

    const appCreateResponse = await kernel.call(
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

    application = appCreateResponse.application;
    token = appCreateResponse.token;
  });

  after(async () => {
    await app.down();
    await kernel.shutdown();
  });

  it('goes to db', (done) => {
    // step 2 - check trips existence in DB
    const checkInDb = new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const response: any = await kernel.handle({
            id: 1,
            jsonrpc: '2.0',
            method: 'trip:list',
            params: {
              params: {},
              _context: { call: { user: { permissions: ['trip.list'] } } },
            },
          });

          expect(response).to.have.property('result');

          resolve(response.result);
        } catch (e) {
          reject(e);
        }
      }, 1000);
    });

    // step 1 - create new journey
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

        // call step 2
        checkInDb
          .then((trips: TripInterface[]) => {
            expect(Array.isArray(trips)).to.be.true;
          })
          .then(done)
          .catch(done);
      })
      .then(() => {}) // this makes the test run completely
      .catch(done);
  });
});
