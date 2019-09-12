// tslint:disable: no-unused-expression
import supertest from 'supertest';
import path from 'path';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { TransportInterface } from '@ilos/common';
import { MongoConnection } from '@ilos/connection-mongo';

import { bootstrap } from '../src/bootstrap';
import { ServiceProvider } from '../src/ServiceProvider';

chai.use(chaiAsPromised);
const { expect } = chai;

let transport: TransportInterface;
let request: supertest.SuperTest<supertest.Test>;

const user = {
  operator: '5d13c703bb3ed9807cad2745',
  operator_name: 'MaxiCovoit',
  permissions: ['journey.create'],
};

const callFactory = (params: any = {}) => ({
  id: 1,
  jsonrpc: '2.0',
  method: 'acquisition:create',
  params: {
    params,
    _context: {
      call: {
        user,
      },
    },
  },
});

const passingJourney = {
  journey_id: '1234',
  operator_class: 'A',
  operator_id: '5d13c703bb3ed9807cad2745',
  passenger: {
    identity: { phone: '+33612345678' },
    start: { datetime: new Date(new Date().getTime() - 1000), literal: 'Paris' },
    end: { datetime: new Date(), literal: 'Evry' },
    contribution: 0,
    incentives: [],
  },
};

describe('Acquisition service', async () => {
  before(async () => {
    process.env.APP_MONGO_DB = 'pdc-test-' + new Date().getTime();
    const configDir = process.env.APP_CONFIG_DIR ? process.env.APP_CONFIG_DIR : './config';
    process.env.APP_CONFIG_DIR = path.join('..', 'dist', configDir);

    transport = await bootstrap.boot('http', 0);
    request = supertest(transport.getInstance());
  });

  after(async () => {
    await (<MongoConnection>transport
      .getKernel()
      .get(ServiceProvider)
      .get(MongoConnection))
      .getClient()
      .db(process.env.APP_MONGO_DB)
      .dropDatabase();

    await transport.down();
  });

  it('#1 - fails on empty payload', async () => {
    return request
      .post('/')
      .send(callFactory())
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
      });
  });

  it('#2 - fails on missing user authorization', async () => {
    return request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'acquisition:create',
        params: {
          params: passingJourney,
          _context: {
            call: {
              user: {},
            },
          },
        },
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(403);
        expect(response.body).to.have.property('error');
      });
  });

  it('#3 - fails on wrong permissions', async () => {
    return request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'acquisition:create',
        params: {
          params: passingJourney,
          _context: {
            call: {
              user: {
                permissions: ['wrong:permission'],
              },
            },
          },
        },
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(403);
        expect(response.body).to.have.property('error');
      });
  });

  it('#4 - fails on method not found', async () => {
    return request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'acquisition:createUnknown',
        params: {},
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(405);
        expect(response.body).to.have.property('error');
      });
  });

  it('#5 - succeeds on create journey', async () => {
    return request
      .post('/')
      .send(callFactory(passingJourney))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result).to.have.property('operator_id', user.operator);
      });
  });
});
