// import chai from 'chai';
// import chaiAsPromised from 'chai-as-promised';
// import { describe } from 'mocha';
// import { PostgresConnection } from '@ilos/connection-postgres';

// import { CertificatePgRepositoryProvider } from '../providers/CertificatePgRepositoryProvider';

// chai.use(chaiAsPromised);
// const { expect } = chai;

// describe('CertificatePgRepositoryProvider', () => {
//   let repository: CertificatePgRepositoryProvider;
//   let connection: PostgresConnection;
//   const inserts: { certs: string[]; uuids: string[]; logs: string[] } = {
//     certs: [],
//     uuids: [],
//     logs: [],
//   };

//   before(async () => {
//     connection = new PostgresConnection({
//       connectionString:
//         'APP_POSTGRES_URL' in process.env
//           ? process.env.APP_POSTGRES_URL
//           : 'postgresql://postgres:postgres@localhost:5432/pdc-local',
//     });

//     await connection.up();

//     repository = new CertificatePgRepositoryProvider(connection);

//     // TODO seed
//   });

//   after(async () => {
//     if (inserts.certs.length) {
//       await connection
//         .getClient()
//         .query(`DELETE FROM certificate.certificates WHERE _id IN (${inserts.certs.join(',')})`);
//     }

//     if (inserts.logs.length) {
//       await connection.getClient().query(`DELETE FROM certificate.access_log WHERE _id IN (${inserts.logs.join(',')})`);
//     }

//     await connection.down();
//   });

//   it('create', async () => {
//     const created = await repository.create({
//       identity_id: '1',
//       operator_id: '2',
//       territory_id: '3',
//       start_at: new Date('2018-01-01'),
//       end_at: new Date('2019-01-01'),
//       meta: {
//         total_km: 1000,
//         total_point: 2000,
//         total_cost: 200,
//         remaining: 300,
//         rows: [{ foo: 'baz' }],
//       },
//     });

//     expect(created).to.have.property('_id');
//     expect(created).to.have.property('uuid');
//     expect(created).to.have.property('identity_id', '1');
//     expect(created).to.have.property('operator_id', '2');
//     expect(created).to.have.property('territory_id', '3');
//     expect(created).to.have.property('start_at');
//     expect(created.start_at.toISOString()).to.eq('2018-01-01T00:00:00.000Z');
//     expect(created).to.have.property('end_at');
//     expect(created.end_at.toISOString()).to.eq('2019-01-01T00:00:00.000Z');
//     expect(created).to.have.property('created_at');
//     expect(created).to.have.property('updated_at');
//     expect(created).to.have.property('meta');

//     inserts.certs.push(created._id);
//     inserts.uuids.push(created.uuid);
//   });

//   it('find by UUID', async () => {
//     if (!inserts.uuids.length) {
//       throw new Error('run the create test before to get a UUID');
//     }

//     const found = await repository.findByUuid(inserts.uuids[0]);
//     expect(found).to.have.property('uuid', inserts.uuids[0]);
//   });

//   it('find by UUID with logs', async () => {
//     if (!inserts.uuids.length) {
//       throw new Error('run the create test before to get a UUID');
//     }

//     const found = await repository.findByUuid(inserts.uuids[0], true);
//     expect(found).to.have.property('uuid', inserts.uuids[0]);
//     expect(found).to.have.property('access_log');

//     // append some log and check for it
//     await repository.logAccess(found._id, {
//       ip: '::1',
//       user_agent: 'test',
//       user_id: '1',
//       content_type: 'text/html',
//     });

//     expect(found.access_log).to.be.an.instanceof(Array);
//     expect(found.access_log.length).to.eq(1, 'No access log found');
//     expect(found.access_log[0]).to.have.property('ip', '::1');
//     expect(found.access_log[0]).to.have.property('user_id', '1');
//     expect(found.access_log[0]).to.have.property('created_at');
//     expect(found.access_log[0].created_at).to.be.an.instanceof(Date);
//   });

//   // TODO
//   it('find by id');
//   it('find by operator id');
//   it('patch meta (by id)');
//   it('log access');
// });
