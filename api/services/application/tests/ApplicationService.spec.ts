// tslint:disable max-classes-per-file
import supertest from 'supertest';
import path from 'path';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { ObjectId } from 'bson';

import { TransportInterface } from '@ilos/common';

import { bootstrap } from '../src/bootstrap';
import { Application } from '../src/entities/Application';

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
    // await (<MongoConnection>transport
    //   .getKernel()
    //   .getContainer()
    //   .get(MongoConnection))
    //   .getClient()
    //   .db(process.env.APP_MONGO_DB)
    //   .dropDatabase();

    await transport.down();
  });

  // Database _id
  let application: Application;

  it('Creates an application', () =>
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
        expect(response.body.result).to.have.property('_id');
        expect(response.body.result).to.have.property('name', 'Application');
        expect(response.body.result).to.have.property('operator_id', operator_id);

        // store the application
        application = response.body.result;
      }));

  it('Find the application by id', () =>
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

  it('Revoke the application', () =>
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
        expect(response.body.result).to.have.property('deletedAt');
        expect(new Date(response.body.result.deletedAt)).to.be.an.instanceOf(Date);
      }));
});
