// tslint:disable max-classes-per-file
import supertest from 'supertest';
import chai from 'chai';
import chaiNock from 'chai-nock';
import { describe } from 'mocha';
import { bootstrap } from '@ilos/framework';
import { MongoProvider } from '@ilos/provider-mongo';
import { Interfaces } from '@ilos/core';

let transport: Interfaces.TransportInterface;
let request;

chai.use(chaiNock);

const { expect } = chai;
const port = '8086';

describe('Territory service', () => {
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

  // Database _id
  let _id: string;

  it('Creates a territory', () =>
    request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'territory:create',
        params: {
          params: { name: 'Toto' },
          _context: {
            call: {
              user: {
                permissions: ['territory.create'],
              },
            },
          },
        },
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result).to.have.property('_id');
        expect(response.body.result).to.have.property('name', 'Toto');

        // store the _id
        _id = response.body.result._id;
      }));

  it('Update a territory', () =>
    request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'territory:patch',
        params: {
          params: {
            _id,
            patch: { name: 'Yop' },
          },
          _context: {
            call: {
              user: {
                permissions: ['territory.update'],
              },
            },
          },
        },
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result).to.have.property('_id', _id);
        expect(response.body.result).to.have.property('name', 'Yop');

        // store the _id
        _id = response.body.result._id;
      }));

  it('Lists all territories', () =>
    request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'territory:all',
        params: {
          params: {},
          _context: {
            call: {
              user: {
                permissions: ['territory.list'],
              },
            },
          },
        },
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result.length).to.eq(1);
        expect(response.body.result[0]).to.have.property('_id', _id);
        expect(response.body.result[0]).to.have.property('name', 'Yop');
      }));

  it('Deletes the territory', () =>
    request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'territory:delete',
        params: {
          params: { _id },
          _context: {
            call: {
              user: {
                permissions: ['territory.delete'],
              },
            },
          },
        },
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result', true);
      }));
});
