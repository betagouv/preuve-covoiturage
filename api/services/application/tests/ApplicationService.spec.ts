// tslint:disable max-classes-per-file
import supertest from 'supertest';
import path from 'path';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { ObjectId } from 'bson';
import { TransportInterface } from '@ilos/common';
import { MongoConnection } from '@ilos/connection-mongo';

import { bootstrap } from '../src/bootstrap';
import { Application } from '../src/entities/Application';
import { ServiceProvider } from '../src/ServiceProvider';

let transport: TransportInterface;
let request;

chai.use(chaiAsPromised);
const { expect } = chai;

// tslint:disable-next-line: variable-name
const operator_id = new ObjectId().toString();

describe('Application service', () => {
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
  let application: Application;

  it('#1 - Creates an application', () =>
    request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'application:create',
        params: {
          params: {
            operator_id,
            name: 'Application',
            permissions: ['journey.create'],
          },
          _context: {
            call: {
              user: {
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
        expect(response.body.result).to.have.property('token');
        expect(response.body.result).to.have.property('application');
        expect(response.body.result.application).to.have.property('_id');
        expect(response.body.result.application).to.have.property('name', 'Application');
        expect(response.body.result.application).to.have.property('operator_id', operator_id);

        // store the application
        application = response.body.result.application;
      }));

  it('#2 - Find the application by id', () =>
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
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result).to.have.property('_id', application._id);
        expect(response.body.result).to.have.property('name', 'Application');
        expect(response.body.result).to.have.property('operator_id', operator_id);
      }));

  it('#3 - Revoke the application', () =>
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
        expect(response.body).to.have.property('result');
        expect(response.body.result).to.have.property('_id', application._id);
        expect(response.body.result).to.have.property('name', 'Application');
        expect(response.body.result).to.have.property('operator_id', operator_id);
        expect(response.body.result).to.have.property('deleted_at');
        expect(new Date(response.body.result.deletedAt)).to.be.an.instanceOf(Date);
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
              operator_id,
              name: 'Application A',
              permissions: ['journey.create'],
            },
            _context: {
              call: {
                user: {
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
              operator_id,
              name: 'Application B',
              permissions: ['journey.create'],
            },
            _context: {
              call: {
                user: {
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
        expect(response.body.result[0]).to.have.property('_id');
        expect(response.body.result[0]).to.have.property('name', 'Application A');
        expect(response.body.result[0]).to.have.property('operator_id', operator_id);
        expect(response.body.result[0]).to.have.property('permissions');
        expect(response.body.result[0]).to.have.property('created_at');
      });
  });
});
