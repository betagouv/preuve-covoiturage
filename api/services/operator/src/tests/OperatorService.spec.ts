import supertest from 'supertest';
import path from 'path';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';

import { bootstrap } from '../bootstrap';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('Operator service', () => {
  let transport;
  let request;

  const callFactory = (method: string, data: any, permissions: string[]): object => ({
    method,
    id: 1,
    jsonrpc: '2.0',
    params: {
      params: data,
      _context: {
        channel: {
          service: 'proxy',
          transport: 'http',
        },
        call: {
          user: {
            permissions,
          },
        },
      },
    },
  });

  before(async () => {
    const configDir = process.env.APP_CONFIG_DIR ? process.env.APP_CONFIG_DIR : './config';
    process.env.APP_CONFIG_DIR = path.join('..', 'dist', configDir);

    transport = await bootstrap.boot('http', 0);
    request = supertest(transport.getInstance());
  });

  after(async () => {
    await transport.down();
  });

  it('Fails on wrong permissions', () => {
    return request
      .post('/')
      .send(
        callFactory(
          'operator:create',
          {
            name: 'Toto',
            legal_name: 'Toto inc.',
          },
          ['wrong.permission'],
        ),
      )
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(403);
        expect(response.body).to.have.property('error');
        expect(response.body.error.data).to.eq('Invalid permissions');
      });
  });

  // id returned by database
  let _id: number;

  it('Create an operator', () => {
    return request
      .post('/')
      .send(
        callFactory(
          'operator:create',
          {
            name: 'Toto',
            legal_name: 'Toto inc.',
            siret: `${String(Math.random() * Math.pow(10, 16)).substr(0, 14)}`,
          },
          ['operator.create'],
        ),
      )
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result).to.have.property('_id');
        expect(response.body.result).to.have.property('name', 'Toto');
        expect(response.body.result).to.have.property('legal_name', 'Toto inc.');

        // store the _id
        _id = response.body.result._id;
      });
  });

  it('Find an operator', () => {
    return request
      .post('/')
      .send(
        callFactory(
          'operator:find',
          {
            _id,
          },
          ['operator.read'],
        ),
      )
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result).to.have.property('_id');
        expect(response.body.result).to.have.property('name', 'Toto');
        expect(response.body.result).to.have.property('legal_name', 'Toto inc.');
      });
  });
  it('Update the operator', () => {
    return request
      .post('/')
      .send(
        callFactory(
          'operator:update',
          {
            _id,
            name: 'Yop',
          },
          ['operator.update'],
        ),
      )
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result).to.have.property('_id', _id);
        expect(response.body.result).to.have.property('name', 'Yop');
        expect(response.body.result).to.have.property('legal_name', 'Toto inc.');
      });
  });

  it('List all operators', () => {
    return request
      .post('/')
      .send(callFactory('operator:list', {}, ['operator.list']))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');

        const results = [...response.body.result.filter((r) => r._id === _id)];
        expect(results.length).to.eq(1);
        expect(results[0]).to.have.property('_id', _id);
        expect(results[0]).to.have.property('name', 'Yop');
        expect(results[0]).to.have.property('legal_name', 'Toto inc.');
        expect(results[0]).not.to.have.property('bank');
        expect(results[0]).not.to.have.property('contacts');
      });
  });

  it('Delete the operator', () => {
    return request
      .post('/')
      .send(callFactory('operator:delete', { _id }, ['operator.delete']))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
      });
  });
});
