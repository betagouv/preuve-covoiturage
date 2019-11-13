import supertest from 'supertest';
import path from 'path';
import chai from 'chai';
import chaiNock from 'chai-nock';
import { describe } from 'mocha';
import { TransportInterface } from '@ilos/common';

import { bootstrap } from '../src/bootstrap';

chai.use(chaiNock);

const { expect } = chai;

describe('Territory service', () => {
  let transport: TransportInterface;
  let request;

  before(async () => {
    const configDir = process.env.APP_CONFIG_DIR ? process.env.APP_CONFIG_DIR : './config';
    process.env.APP_CONFIG_DIR = path.join('..', 'dist', configDir);

    transport = await bootstrap.boot('http', 0);
    request = supertest(transport.getInstance());
  });

  after(async () => {
    await transport.down();
  });

  // Database _id
  let _id: string;

  it('Create a territory', () =>
    request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'territory:create',
        params: {
          params: {
            name: 'Toto',
            siret: `${String(Math.random() * Math.pow(10, 16)).substr(0, 14)}`,
          },
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

  it('Find a territory', () =>
    request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'territory:find',
        params: {
          params: { _id },
          _context: {
            call: {
              user: {
                permissions: ['territory.read'],
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
      }));

  it('Update a territory', () =>
    request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'territory:update',
        params: {
          params: {
            _id,
            name: 'Yop',
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

        const results = response.body.result.data.filter((r) => r._id === _id);
        expect(results.length).to.eq(1);
        expect(results[0]).to.have.property('_id', _id);
        expect(results[0]).to.have.property('name', 'Yop');
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
      }));
});
