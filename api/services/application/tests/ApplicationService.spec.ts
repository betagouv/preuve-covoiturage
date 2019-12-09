// tslint:disable max-classes-per-file
import supertest from 'supertest';
import path from 'path';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { ObjectId } from 'bson';
import { TransportInterface } from '@ilos/common';

import { bootstrap } from '../src/bootstrap';

let transport: TransportInterface;
let request;

chai.use(chaiAsPromised);
const { expect } = chai;

// tslint:disable-next-line: variable-name
const operator_id = new ObjectId().toString();

describe('Application service', () => {
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
  let application;

  it('#1 - Creates an application', () =>
    request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'application:create',
        params: {
          params: {
            name: 'Application',
          },
          _context: {
            call: {
              user: {
                operator: operator_id,
                permissions: ['application.create'],
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
        expect(response.body.result).to.have.property('name', 'Application');
        expect(response.body.result).to.have.property('owner_id', operator_id);
        expect(response.body.result).to.have.property('owner_service', 'operator');
        expect(new Date(response.body.result.created_at)).is.a('date');
        expect(response.body.result.deleted_at).is.eq(null);

        // store the application
        application = response.body.result;
      }));

  it('#2.0 - Find the application by id', () =>
    request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'application:find',
        params: {
          params: {
            _id: application._id,
          },
          _context: {
            call: {
              user: {
                operator: operator_id,
                permissions: ['application.find'],
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
        expect(response.body.result).to.have.property('_id', application._id);
        expect(response.body.result).to.have.property('name', 'Application');
        expect(response.body.result).to.have.property('owner_id', operator_id);
        expect(response.body.result).to.have.property('owner_service', 'operator');
      }));

  it('#2.1 - Fails if no owner set', () =>
    request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'application:find',
        params: {
          params: {
            _id: application._id,
          },
          _context: {
            call: {
              user: {
                permissions: ['application.find'],
              },
            },
          },
        },
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('code', -32602);
        expect(response.body.error).to.have.property('message', 'Invalid params');
        expect(response.body.error).to.have.property('data', 'Application owner service must be set');
      }));

  it("#3.0 - Cannot revoke another op's app", () =>
    request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'application:revoke',
        params: {
          params: {
            _id: application._id,
          },
          _context: {
            call: {
              user: {
                // generate false operator_id
                operator: String(operator_id)
                  .split('')
                  .reverse()
                  .join(''),
                permissions: ['application.revoke'],
              },
            },
          },
        },
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('error');
      }));

  it('#3.1 - Revoke the application OK', () =>
    request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'application:revoke',
        params: {
          params: {
            _id: application._id,
          },
          _context: {
            call: {
              user: {
                operator: operator_id,
                permissions: ['application.revoke'],
              },
            },
          },
        },
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.deep.eq({ id: 1, jsonrpc: '2.0' });
      }));

  it('#3.2 - Cannot revoke twice the same app', () =>
    request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'application:revoke',
        params: {
          params: {
            _id: application._id,
          },
          _context: {
            call: {
              user: {
                operator: operator_id,
                permissions: ['application.revoke'],
              },
            },
          },
        },
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('error');
      }));

  it('#4 - List applications', async () => {
    // insert 2 applications
    // the one created by test #1 is soft deleted and should not appear in the results
    await request
      .post('/')
      .send([
        {
          id: 1,
          jsonrpc: '2.0',
          method: 'application:create',
          params: {
            params: {
              name: 'Application A',
            },
            _context: {
              call: {
                user: {
                  operator: operator_id,
                  permissions: ['application.create'],
                },
              },
            },
          },
        },
        {
          id: 2,
          jsonrpc: '2.0',
          method: 'application:create',
          params: {
            params: {
              name: 'Application B',
            },
            _context: {
              call: {
                user: {
                  operator: operator_id,
                  permissions: ['application.create'],
                },
              },
            },
          },
        },
      ])
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');

    return request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'application:list',
        params: {
          params: {
            operator_id,
          },
          _context: {
            call: {
              user: {
                operator: operator_id,
                permissions: ['application.list'],
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
        expect(response.body.result.length).to.eq(2);
        const results = response.body.result.sort((a, b) => (a > b ? 1 : -1));

        expect(results[0]).to.have.property('name', 'Application A');
        expect(results[1]).to.have.property('name', 'Application B');
      });
  });
});
