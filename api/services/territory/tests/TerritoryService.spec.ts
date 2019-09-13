import supertest from 'supertest';
import path from 'path';
import chai from 'chai';
import chaiNock from 'chai-nock';
import { describe } from 'mocha';
import { TransportInterface } from '@ilos/common';
import { MongoConnection } from '@ilos/connection-mongo';

import { bootstrap } from '../src/bootstrap';
import { ServiceProvider } from '../src/ServiceProvider';

chai.use(chaiNock);

const { expect } = chai;

describe('Territory service', () => {
  let transport: TransportInterface;
  let request;

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
        method: 'territory:list',
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
        expect(response.body.result).to.have.property('data');
        expect(response.body.result.data.length).to.eq(1);
        expect(response.body.result.data[0]).to.have.property('_id', _id);
        expect(response.body.result.data[0]).to.have.property('name', 'Yop');
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
