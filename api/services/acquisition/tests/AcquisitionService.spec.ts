// tslint:disable: no-unused-expression

import supertest from 'supertest';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { bootstrap } from '@ilos/framework';
import { MongoProvider } from '@ilos/provider-mongo';
import { Interfaces } from '@ilos/core';

chai.use(chaiAsPromised);
const { expect } = chai;
const port = '8081';

let transport: Interfaces.TransportInterface;
let request: supertest.SuperTest<supertest.Test>;

const callFactory = (params: any = {}) => ({
  id: 1,
  jsonrpc: '2.0',
  method: 'acquisition:createJourney',
  params: {
    params,
    _context: {
      call: {
        user: {
          operator: '5d13c703bb3ed9807cad2745',
          operator_name: 'MaxiCovoit',
          permissions: ['journey.create'],
        },
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
    start: { datetime: new Date(), literal: 'Paris' },
    end: { datetime: new Date(), literal: 'Evry' },
    contribution: 0,
    incentives: [],
  },
};

describe('Acquisition service', async () => {
  before(async () => {
    process.env.APP_MONGO_DB = 'pdc-test-' + new Date().getTime();

    transport = await bootstrap.boot(['', '', 'http', port]);
    request = supertest(transport.getInstance());
  });

  after(async () => {
    await (<MongoProvider>transport
      .getKernel()
      .getContainer()
      .get(MongoProvider))
      .getDb(process.env.APP_MONGO_DB)
      .then((db) => db.dropDatabase());

    await transport.down();
  });

  it('Empty payload fails', async () => {
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

  it('Missing user authorization', async () => {
    return request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'acquisition:createJourney',
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
        expect(response.status).to.equal(503);
        expect(response.body).to.have.property('error');
      });
  });

  it('Method not found', async () => {
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

  it('Creates journey', async () => {
    return request
      .post('/')
      .send(callFactory(passingJourney))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
      });
  });
});
