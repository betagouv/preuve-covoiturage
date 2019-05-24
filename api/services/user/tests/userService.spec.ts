// tslint:disable max-classes-per-file
import { MongoMemoryServer } from 'mongodb-memory-server';
import axios from 'axios';
import chai from 'chai';
import chaiNock from 'chai-nock';
import { bootstrap } from '@pdc/core';
import { MongoProvider } from '@pdc/provider-mongo';

let mongoServer;
let connectionString;
let dbName;
let kernel;
let transport;
let request;

chai.use(chaiNock);

const { expect } = chai;
const port = '8081';


const mockConnectedUser = { // todo : to be added in context
  _id: '1ab',
  email: 'admin@example.com',
  firstname: 'admin',
  lastname: 'admin',
  fullname: 'admin admin',
  phone: '0622222233',
  group: 'registry',
  role: 'admin',
};


// mocks
const mockNewUser = {
  email: 'edouard.nelson@example.com',
  firstname: 'edouard',
  lastname: 'nelson',
  phone: '0622222233',
  group: 'registry',
  role: 'admin',
  aom: 'aomid',
  password: 'password',
};

const mockUpdatedProperties = {
  firstname: 'johnny',
  lastname: 'smith',
};

describe('User service', () => {
  before(async () => {
    mongoServer = new MongoMemoryServer();
    connectionString = await mongoServer.getConnectionString();
    dbName = await mongoServer.getDbName();
    process.env.APP_MONGO_URL = connectionString;
    process.env.APP_MONGO_DB = dbName;
    transport = await bootstrap.boot(['', '', 'http', port]);
    kernel = transport.getKernel();
    request = axios.create({
      baseURL: `http://127.0.0.1:${port}`,
      timeout: 1000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  });

  after(async () => {
    await (<MongoProvider>kernel.getContainer().get(MongoProvider)).close();
    await transport.down();
    await mongoServer.stop();
  });

  let createdUserId;
  it('should create user', async () => {
    const { status: createStatus, data: createData } = await request.post(
      '/',
      {
        id: 1,
        jsonrpc: '2.0',
        method: 'user:create',
        params: mockNewUser,
      });
    expect(createData.result).to.include({
      email: mockNewUser.email,
      firstname: mockNewUser.firstname,
      lastname: mockNewUser.lastname,
      phone: mockNewUser.phone,
      group: mockNewUser.group,
      role: mockNewUser.role,
      aom: mockNewUser.aom,
    });
    expect(createStatus).equal(200);

    createdUserId = createData.result._id;
  });

  it('should find user', async () => {
    const { status: status, data: data } = await request.post('/', {
      id: 1,
      jsonrpc: '2.0',
      method: 'user:find',
      params: { id: createdUserId },
    });
    expect(data.result).to.include({
      _id: createdUserId,
      email: mockNewUser.email,
      firstname: mockNewUser.firstname,
      lastname: mockNewUser.lastname,
      phone: mockNewUser.phone,
      group: mockNewUser.group,
      role: mockNewUser.role,
      aom: mockNewUser.aom,
    });
    expect(status).equal(200);
  });

  it('should list users', async () => {
    const { status: status, data: data } = await request.post('/', {
      id: 1,
      jsonrpc: '2.0',
      method: 'user:list',
      params: {},
    });
    console.log(data.result.data[0]);
    expect(data.result.data[0]).to.include({
      _id: createdUserId,
      email: mockNewUser.email,
      firstname: mockNewUser.firstname,
      lastname: mockNewUser.lastname,
      phone: mockNewUser.phone,
      group: mockNewUser.group,
      role: mockNewUser.role,
      aom: mockNewUser.aom,
    });
    expect(status).equal(200);
  });

  it('should patch user', async () => {
    const { status: status, data: data } = await request.post('/', {
      id: 1,
      jsonrpc: '2.0',
      method: 'user:patch',
      params: {
        id: createdUserId,
        patch: mockUpdatedProperties,
      },
    });
    console.log('patch', data.result);
    expect(data.result).to.include({
      _id: createdUserId,
      email: mockNewUser.email,
      firstname: mockUpdatedProperties.firstname,
      lastname: mockUpdatedProperties.lastname,
      phone: mockNewUser.phone,
      group: mockNewUser.group,
      role: mockNewUser.role,
      aom: mockNewUser.aom,
    });
    expect(status).equal(200);
  });

  it('should delete user', async () => {
    const { status: status, data: data } = await request.post('/', {
      id: 1,
      jsonrpc: '2.0',
      method: 'user:delete',
      params: {
        ...mockUpdatedProperties,
      },
    });
    expect(status).equal(200);
    expect(data.result['deletedAt']).to.not.equal(null);
  });
});
