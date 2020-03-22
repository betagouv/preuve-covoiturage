// import path from 'path';
// import supertest from 'supertest';
// import chai from 'chai';
// import chaiNock from 'chai-nock';
// import { describe } from 'mocha';
// import { TransportInterface } from '@ilos/common';
// import { MongoConnection } from '@ilos/connection-mongo';

// import { ServiceProvider } from '../src/ServiceProvider';
// import { bootstrap } from '../src/bootstrap';
// import { callFactory } from './callFactory';

// chai.use(chaiNock);

// const { expect } = chai;

// describe('User service: login', () => {
//   let transport: TransportInterface;
//   let request;

//   before(async () => {
//     process.env.APP_MONGO_DB = 'pdc-user-' + new Date().getTime();
//     const configDir = process.env.APP_CONFIG_DIR ? process.env.APP_CONFIG_DIR : './config';
//     process.env.APP_CONFIG_DIR = path.join('..', 'dist', configDir);

//     transport = await bootstrap.boot('http', 0);
//     request = supertest(transport.getInstance());
//   });

//   after(async () => {
//     await (<MongoConnection>transport
//       .getKernel()
//       .get(ServiceProvider)
//       .get(MongoConnection))
//       .getClient()
//       .db(process.env.APP_MONGO_DB)
//       .dropDatabase();

//     await transport.down();
//   });

//   it('#1 - Fails on wrong credentials', () =>
//     request
//       .post('/')
//       .send(
//         callFactory('login', {
//           email: 'unauthorized@example.com',
//           password: 'admin1234',
//         }),
//       )
//       .set('Accept', 'application/json')
//       .set('Content-Type', 'application/json')
//       .expect((response: supertest.Response) => {
//         expect(response.status).to.equal(401);
//         expect(response.body).to.have.property('error');
//       }));

//   it('#2 - Fails on empty credentials', () =>
//     request
//       .post('/')
//       .send(callFactory('login', {}))
//       .set('Accept', 'application/json')
//       .set('Content-Type', 'application/json')
//       .expect((response: supertest.Response) => {
//         expect(response.status).to.equal(400);
//         expect(response.body).to.have.property('error');
//         expect(response.body.error).to.have.property('message', 'Invalid params');
//       }));

//   it('#3 - Fails on invalid credentials', () =>
//     request
//       .post('/')
//       .send(
//         callFactory('login', {
//           email: 'admin@example.com',
//           password: 'admin1234',
//           additional: 'param',
//         }),
//       )
//       .set('Accept', 'application/json')
//       .set('Content-Type', 'application/json')
//       .expect((response: supertest.Response) => {
//         expect(response.status).to.equal(400);
//         expect(response.body).to.have.property('error');
//         expect(response.body.error).to.have.property('message', 'Invalid params');
//         expect(response.body.error).to.have.property('data', 'data should NOT have additional properties');
//       }));

//   it('#4 - Succeeds on right credentials', async () => {
//     // register an admin
//     const resp = <any>await transport.getKernel().handle({
//       id: 1,
//       jsonrpc: '2.0',
//       method: 'user:register',
//       params: {
//         params: {
//           email: 'admin@example.com',
//           password: 'admin1234',
//           firstname: 'Admin',
//           lastname: 'Example',
//           group: 'registry',
//           role: 'admin',
//         },
//         _context: { call: { user: { permissions: ['user.register'] } } },
//       },
//     });

//     expect(resp).to.have.property('result');
//     expect(resp.result).to.have.property('_id');
//     expect(resp.result).to.have.property('email', 'admin@example.com');

//     // force account to be active to bypass the email validation process
//     await (<MongoConnection>transport
//       .getKernel()
//       .get(ServiceProvider)
//       .get(MongoConnection))
//       .getClient()
//       .db(process.env.APP_MONGO_DB)
//       .collection('users')
//       .updateOne({ email: 'admin@example.com' }, { $set: { status: 'active' } });

//     // log the user
//     return request
//       .post('/')
//       .send(
//         callFactory('login', {
//           email: 'admin@example.com',
//           password: 'admin1234',
//         }),
//       )
//       .set('Accept', 'application/json')
//       .set('Content-Type', 'application/json')
//       .expect((response: supertest.Response) => {
//         expect(response.status).to.equal(200);
//         expect(response.body).to.have.property('result');
//         expect(response.body.result).to.have.property('_id', resp.result._id);
//         expect(response.body.result).to.have.property('email', 'admin@example.com');
//       });
//   });

//   it('#10 - Fails on pending status', async () => {
//     // register an admin
//     const resp = <any>await transport.getKernel().handle({
//       id: 1,
//       jsonrpc: '2.0',
//       method: 'user:register',
//       params: {
//         params: {
//           email: 'pending@example.com',
//           password: 'admin1234',
//           firstname: 'Admin',
//           lastname: 'Example',
//           group: 'registry',
//           role: 'admin',
//         },
//         _context: { call: { user: { permissions: ['user.register'] } } },
//       },
//     });

//     expect(resp).to.have.property('result');
//     expect(resp.result).to.have.property('_id');
//     expect(resp.result).to.have.property('email', 'pending@example.com');
//     expect(resp.result).to.have.property('status', 'pending');

//     // log the user
//     return request
//       .post('/')
//       .send(
//         callFactory('login', {
//           email: 'pending@example.com',
//           password: 'admin1234',
//         }),
//       )
//       .set('Accept', 'application/json')
//       .set('Content-Type', 'application/json')
//       .expect((response: supertest.Response) => {
//         expect(response.status).to.equal(401);
//         expect(response.body).to.have.property('error');
//         expect(response.body.error).to.have.property('code', -32501);
//         expect(response.body.error).to.have.property('data', 'Account is pending validation');
//       });
//   });

//   it('#11 - Fails on invited status', async () => {
//     // register an admin
//     const resp = <any>await transport.getKernel().handle({
//       id: 1,
//       jsonrpc: '2.0',
//       method: 'user:register',
//       params: {
//         params: {
//           email: 'invited@example.com',
//           password: 'admin1234',
//           firstname: 'Admin',
//           lastname: 'Example',
//           group: 'registry',
//           role: 'admin',
//         },
//         _context: { call: { user: { permissions: ['user.register'] } } },
//       },
//     });

//     expect(resp).to.have.property('result');
//     expect(resp.result).to.have.property('_id');
//     expect(resp.result).to.have.property('email', 'invited@example.com');
//     expect(resp.result).to.have.property('status', 'pending');

//     // force account to be invited to bypass the email validation process
//     await (<MongoConnection>transport
//       .getKernel()
//       .get(ServiceProvider)
//       .get(MongoConnection))
//       .getClient()
//       .db(process.env.APP_MONGO_DB)
//       .collection('users')
//       .updateOne({ email: 'invited@example.com' }, { $set: { status: 'invited' } });

//     // log the user
//     return request
//       .post('/')
//       .send(
//         callFactory('login', {
//           email: 'invited@example.com',
//           password: 'admin1234',
//         }),
//       )
//       .set('Accept', 'application/json')
//       .set('Content-Type', 'application/json')
//       .expect((response: supertest.Response) => {
//         expect(response.status).to.equal(401);
//         expect(response.body).to.have.property('error');
//         expect(response.body.error).to.have.property('code', -32501);
//         expect(response.body.error).to.have.property('data', 'Account must be confirmed');
//       });
//   });

//   it('#12 - Fails on blocked status', async () => {
//     // register an admin
//     const resp = <any>await transport.getKernel().handle({
//       id: 1,
//       jsonrpc: '2.0',
//       method: 'user:register',
//       params: {
//         params: {
//           email: 'blocked@example.com',
//           password: 'admin1234',
//           firstname: 'Admin',
//           lastname: 'Example',
//           group: 'registry',
//           role: 'admin',
//         },
//         _context: { call: { user: { permissions: ['user.register'] } } },
//       },
//     });

//     expect(resp).to.have.property('result');
//     expect(resp.result).to.have.property('_id');
//     expect(resp.result).to.have.property('email', 'blocked@example.com');
//     expect(resp.result).to.have.property('status', 'pending');

//     // force account to be blockd to bypass the email validation process
//     await (<MongoConnection>transport
//       .getKernel()
//       .get(ServiceProvider)
//       .get(MongoConnection))
//       .getClient()
//       .db(process.env.APP_MONGO_DB)
//       .collection('users')
//       .updateOne({ email: 'blocked@example.com' }, { $set: { status: 'blocked' } });

//     // log the user
//     return request
//       .post('/')
//       .send(
//         callFactory('login', {
//           email: 'blocked@example.com',
//           password: 'admin1234',
//         }),
//       )
//       .set('Accept', 'application/json')
//       .set('Content-Type', 'application/json')
//       .expect((response: supertest.Response) => {
//         expect(response.status).to.equal(401);
//         expect(response.body).to.have.property('error');
//         expect(response.body.error).to.have.property('code', -32501);
//         expect(response.body.error).to.have.property('data', 'Account is blocked');
//       });
//   });
// });
