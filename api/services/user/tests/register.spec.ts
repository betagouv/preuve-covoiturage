import path from 'path';
import supertest from 'supertest';
import chai from 'chai';
import chaiNock from 'chai-nock';
import { describe } from 'mocha';
import { TransportInterface } from '@ilos/common';
import { MongoConnection } from '@ilos/connection-mongo';

import { ServiceProvider } from '../src/ServiceProvider';
import { bootstrap } from '../src/bootstrap';
import { callFactory } from './callFactory';

chai.use(chaiNock);

const { expect } = chai;

describe('User service : register', () => {
  let transport: TransportInterface;
  let request;

  before(async () => {
    process.env.APP_MONGO_DB = 'pdc-user-' + new Date().getTime();
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

  it('Register Super Admin', () =>
    request
      .post('/')
      .send(
        callFactory('register', {
          email: 'admin@example.com',
          password: 'admin1234',
          firstname: 'Admin',
          lastname: 'Example',
          group: 'registry',
          role: 'admin',
        }),
      )
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result).to.have.property('_id');
        expect(response.body.result).to.have.property('email', 'admin@example.com');

        // store the _id
        _id = response.body.result._id;
      }));

  it('Double register', async () => {
    const duplicate = {
      email: 'duplicate@example.com',
      password: 'admin1234',
      firstname: 'Admin',
      lastname: 'Example',
      group: 'registry',
      role: 'admin',
    };

    // register the user once
    await request
      .post('/')
      .send(callFactory('register', duplicate))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        // console.log(response.status, response.text);
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result).to.have.property('_id');
        expect(response.body.result).to.have.property('email', 'duplicate@example.com');
      });

    return request
      .post('/')
      .send(callFactory('register', duplicate))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        // console.log(response.status, response.text);
        expect(response.status).to.equal(409);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('message', 'Conflict');
      });
  });

  it('Misses email', () =>
    request
      .post('/')
      .send(
        callFactory('register', {
          // email: 'admin@example.com',
          password: 'admin1234',
          firstname: 'Admin',
          lastname: 'Example',
          group: 'registry',
          role: 'admin',
        }),
      )
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('message', 'Invalid params');
        expect(response.body.error).to.have.property('data', "data should have required property '.email'");
      }));
});
