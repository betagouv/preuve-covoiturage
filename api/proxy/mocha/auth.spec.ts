// import path from 'path';
// import supertest from 'supertest';
// import chai from 'chai';
// import { describe } from 'mocha';
// import { MongoConnection } from '@ilos/connection-mongo';
// import { CryptoProvider } from '@pdc/provider-crypto';

// import { HttpTransport } from '../src/HttpTransport';
// import { Kernel } from '../src/Kernel';

// const { expect } = chai;

// describe('Proxy auth', async () => {
//   const krn = new Kernel();
//   const app = new HttpTransport(krn);
//   let request;
//   let db;
//   let collection;
//   let crypto;
//   let tokenPlain;
//   let tokenBcrypt;

//   before(async () => {
//     const configDir = process.env.APP_CONFIG_DIR ? process.env.APP_CONFIG_DIR : './config';
//     process.env.APP_CONFIG_DIR = path.join('..', 'dist', configDir);

//     await krn.bootstrap();
//     await app.up(['0']);

//     // Database connection
//     const connection = new MongoConnection({ connectionString: process.env.APP_MONGO_URL });
//     await connection.up();
//     db = connection.getClient().db(process.env.APP_MONGO_DB);
//     collection = db.collection('users');

//     // Crypto Provider
//     crypto = new CryptoProvider();
//     tokenPlain = crypto.generateToken();
//     tokenBcrypt = await crypto.cryptToken(tokenPlain);
//   });

//   after(async () => {
//     await db.dropDatabase();
//     await app.down();
//   });

//   beforeEach(() => {
//     request = supertest(app.app);
//   });

//   it('should call reset-password', async () => {
//     // register a new user
//     await krn.handle({
//       id: 1,
//       jsonrpc: '2.0',
//       method: 'user:register',
//       params: {
//         params: {
//           email: 'reset@example.com',
//           password: 'admin1234',
//           firstname: 'admin',
//           lastname: 'example',
//           group: 'registry',
//           role: 'admin',
//         },
//         _context: {
//           call: { user: { permissions: ['user.register'] } },
//         },
//       },
//     });

//     // @TODO add expect()

//     return request
//       .post('/auth/reset-password')
//       .send({ email: 'reset@example.com' })
//       .set('Accept', 'application/json')
//       .set('Content-Type', 'application/json')
//       .expect((response) => {
//         console.log(response.body);
//         expect(response.status).to.eq(200);
//       });
//   });

//   it('should call check-token', async () => {
//     // register a new user
//     await krn.handle({
//       id: 1,
//       jsonrpc: '2.0',
//       method: 'user:register',
//       params: {
//         params: {
//           email: 'check-token@example.com',
//           password: 'admin1234',
//           firstname: 'admin',
//           lastname: 'example',
//           group: 'registry',
//           role: 'admin',
//         },
//         _context: {
//           call: { user: { permissions: ['user.register'] } },
//         },
//       },
//     });

//     // @TODO add expect()

//     // patch the token and tz
//     await collection.updateOne(
//       { email: 'check-token@example.com' },
//       {
//         $set: {
//           forgotten_token: tokenBcrypt,
//           forgotten_at: new Date(),
//         },
//       },
//     );

//     // check if email and token are valid
//     return request
//       .post('/auth/check-token')
//       .send({ email: 'check-token@example.com', token: tokenPlain })
//       .set('Accept', 'application/json')
//       .set('Content-Type', 'application/json')
//       .expect((response) => {
//         // @TODO add expect()
//         expect(response.status).to.eq(200);
//       });
//   });

//   it('should call change-password', async () => {
//     // register a new user
//     await krn.handle({
//       id: 1,
//       jsonrpc: '2.0',
//       method: 'user:register',
//       params: {
//         params: {
//           email: 'change-password@example.com',
//           password: 'admin1234',
//           firstname: 'admin',
//           lastname: 'example',
//           group: 'registry',
//           role: 'admin',
//         },
//         _context: {
//           call: { user: { permissions: ['user.register'] } },
//         },
//       },
//     });

//     // @TODO add expect()

//     // patch the token and tz
//     await collection.updateOne(
//       { email: 'change-password@example.com' },
//       {
//         $set: {
//           forgotten_token: tokenBcrypt,
//           forgotten_at: new Date(),
//         },
//       },
//     );

//     // check if email and token are valid
//     return request
//       .post('/auth/change-password')
//       .send({ email: 'change-password@example.com', token: tokenPlain, password: '4321admin' })
//       .set('Accept', 'application/json')
//       .set('Content-Type', 'application/json')
//       .expect((response) => {
//         // @TODO
//         // console.log(response.body);
//         expect(response.status).to.eq(200);
//       });
//   });

//   it('should call confirm-email', async () => {
//     // register a new user
//     const usr: any = await krn.handle({
//       id: 1,
//       jsonrpc: '2.0',
//       method: 'user:register',
//       params: {
//         params: {
//           email: 'confirm-email@example.com',
//           password: 'admin1234',
//           firstname: 'admin',
//           lastname: 'example',
//           group: 'registry',
//           role: 'admin',
//         },
//         _context: {
//           call: { user: { permissions: ['user.register'] } },
//         },
//       },
//     });

//     // check creation status
//     expect(usr).to.have.property('result');
//     expect(usr.result).to.have.property('status', 'pending');

//     // patch the token and tz
//     await collection.updateOne(
//       { email: 'confirm-email@example.com' },
//       {
//         $set: {
//           forgotten_token: tokenBcrypt,
//           forgotten_at: new Date(),
//         },
//       },
//     );

//     // check if email and token are valid
//     return request
//       .post('/auth/confirm-email')
//       .send({ email: 'confirm-email@example.com', token: tokenPlain })
//       .set('Accept', 'application/json')
//       .set('Content-Type', 'application/json')
//       .expect((response) => {
//         // check confirmation status
//         expect(response.status).to.eq(200);
//         expect(response.body).to.have.property('result');
//         expect(response.body.result).to.have.property('data');
//         expect(response.body.result.data).to.have.property('status', 'active');
//       });
//   });
// });
