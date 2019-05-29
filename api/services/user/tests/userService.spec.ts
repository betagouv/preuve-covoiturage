// tslint:disable max-classes-per-file
import { MongoMemoryServer } from 'mongodb-memory-server';
import axios from 'axios';
import chai from 'chai';
import chaiNock from 'chai-nock';
import { bootstrap, Exceptions } from '@pdc/core';
import { MongoProvider } from '@pdc/provider-mongo';
import { operator } from '../../../legacy/shared/middlewares/src';

let mongoServer;
let connectionString;
let dbName;
let kernel;
let transport;
let request;

chai.use(chaiNock);

const { expect } = chai;
const port = '8081';


const errorFactory = (err: Exceptions.RPCException) => {
  return {
    status: 200,
    data: {
      jsonrpc: '2.0',
      id: 1,
      error: {
        code: err.rpcError.code,
        message: err.rpcError.message,
        data: err.rpcError.data,
      },
    },
  };
};

const mockConnectedUserBase = {
  _id: '1ab',
  email: 'admin@example.com',
  firstname: 'admin',
  lastname: 'admin',
  fullname: 'admin admin',
  phone: '0622222233',
};

const callFactory = (method: string, data: any, permissions: string[],
                     group:string = 'registry', role:string = 'admin', aomOperator: { aom?:string, operator?:string} = {}) => ({
                       id: 1,
                       jsonrpc: '2.0',
                       method,
                       params: {
                         params: data,
                         _context: {
                           channel: {
                             service: 'proxy',
                             transport: 'http',
                           },
                           call: {
                             user: { ...mockConnectedUserBase, permissions, group, role, ...aomOperator },
                           },
                         },
                       },
                     });


const mockNewUserBase = {
  firstname: 'edouard',
  lastname: 'nelson',
  phone: '0622222233',
  password: 'password',
};


const newUserFactory = (group:string = 'registry', role:string = 'admin', aomOperator: { aom?:string, operator?:string} = {}, email?) => ({
  ...mockNewUserBase,
  group,
  role,
  email : email || `${mockNewUserBase.firstname}.${mockNewUserBase.lastname}@${group}.com`,
  ...aomOperator,
});


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


  /*

  Création d'un utilisateur

   */
  const newAomUser = newUserFactory('aom', 'user', { aom: 'aomId' });
  const newOperatorUser = newUserFactory('operators', 'user', { operator: 'operatorId' });
  const newRegistryAdmin = newUserFactory();
  const newRegistryUser = newUserFactory('registry', 'user');


  let createdRegistryUserId;
  let createdAomUserId;
  let createdOperatorUserId;
  it('registry admin - should create user registry', async () => {
    const { status: createStatus, data: createData } = await request.post(
      '/',
      callFactory(
        'user:create',
        newRegistryUser,
        ['user.create'],
      ));
    expect(createData.result).to.include({
      email: newRegistryUser.email,
      firstname: newRegistryUser.firstname,
      lastname: newRegistryUser.lastname,
      phone: newRegistryUser.phone,
      group: newRegistryUser.group,
      role: newRegistryUser.role,
    });
    expect(createStatus).equal(200);

    createdRegistryUserId = createData.result._id;
  });

  it('aom admin - should create user aom', async () => {
    const { status: createStatus, data: createData } = await request.post(
      '/',
      callFactory(
        'user:create',
        newAomUser,
        ['aom.users.add'],
        newAomUser.group,
        'admin',
        { aom: newAomUser.aom },
      ));
    expect(createData.result).to.include({
      email: newAomUser.email,
      firstname: newAomUser.firstname,
      lastname: newAomUser.lastname,
      phone: newAomUser.phone,
      group: newAomUser.group,
      role: newAomUser.role,
      aom: newAomUser.aom,
    });
    expect(createStatus).equal(200);

    createdAomUserId = createData.result._id;
  });

  it('operator admin - should create user operator', async () => {
    const { status: createStatus, data: createData } = await request.post(
      '/',
      callFactory(
        'user:create',
        newOperatorUser,
        ['operator.users.add'],
        newOperatorUser.group,
        'admin',
        { operator: newOperatorUser.operator },
      ));
    expect(createData.result).to.include({
      email: newOperatorUser.email,
      firstname: newOperatorUser.firstname,
      lastname: newOperatorUser.lastname,
      phone: newOperatorUser.phone,
      group: newOperatorUser.group,
      role: newOperatorUser.role,
      operator: newOperatorUser.operator,
    });
    expect(createStatus).equal(200);

    createdOperatorUserId = createData.result._id;
  });

  it('registry admin - should find registry user', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      callFactory(
      'user:find',
      { id: createdRegistryUserId },
      ['user.read'],
    ));
    expect(data.result).to.include({
      _id: createdRegistryUserId,
      email: newRegistryUser.email,
      firstname: newRegistryUser.firstname,
      lastname: newRegistryUser.lastname,
      phone: newRegistryUser.phone,
      group: newRegistryUser.group,
      role: newRegistryUser.role,
    });
    expect(status).equal(200);
  });

  it('registry admin should find aom user', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      callFactory(
        'user:find',
        { id: createdAomUserId },
        ['user.read'],
      ));
    expect(data.result).to.include({
      _id: createdAomUserId,
      email: newAomUser.email,
      firstname: newAomUser.firstname,
      lastname: newAomUser.lastname,
      phone: newAomUser.phone,
      group: newAomUser.group,
      role: newAomUser.role,
      aom: newAomUser.aom,
    });
    expect(status).equal(200);
  });

  it('registry admin - should find operator user', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      callFactory(
        'user:find',
        { id: createdOperatorUserId },
        ['user.read'],
      ));
    expect(data.result).to.include({
      _id: createdOperatorUserId,
      email: newOperatorUser.email,
      firstname: newOperatorUser.firstname,
      lastname: newOperatorUser.lastname,
      phone: newOperatorUser.phone,
      group: newOperatorUser.group,
      role: newOperatorUser.role,
      operator: newOperatorUser.operator,
    });
    expect(status).equal(200);
  });

  it('registry admin - should list users', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      callFactory(
        'user:list',
        {},
        ['user.list'],
      ));
    expect(data.result.data[0]).to.include({
      _id: createdRegistryUserId,
      email: newRegistryUser.email,
      firstname: newRegistryUser.firstname,
      lastname: newRegistryUser.lastname,
      phone: newRegistryUser.phone,
      group: newRegistryUser.group,
      role: newRegistryUser.role,
    });
    expect(data.result.data[1]).to.include({
      _id: createdAomUserId,
      email: newAomUser.email,
      firstname: newAomUser.firstname,
      lastname: newAomUser.lastname,
      phone: newAomUser.phone,
      group: newAomUser.group,
      role: newAomUser.role,
      aom: newAomUser.aom,
    });
    expect(data.result.data[2]).to.include({
      _id: createdOperatorUserId,
      email: newOperatorUser.email,
      firstname: newOperatorUser.firstname,
      lastname: newOperatorUser.lastname,
      phone: newOperatorUser.phone,
      group: newOperatorUser.group,
      role: newOperatorUser.role,
      operator: newOperatorUser.operator,
    });
    expect(status).equal(200);
  });

  it('registry admin - should patch registry user', async () => {
    const mockUpdatedProperties = {
      firstname: 'johnny',
      lastname: 'smith',
    };

    const { status: status, data: data } = await request.post(
      '/',
      callFactory(
        'user:patch',
        {
          id: createdRegistryUserId,
          patch: mockUpdatedProperties,
        },
        ['user.update'],
      ));
    expect(data.result).to.include({
      _id: createdRegistryUserId,
      email: newRegistryUser.email,
      firstname: mockUpdatedProperties.firstname,
      lastname: mockUpdatedProperties.lastname,
      phone: newRegistryUser.phone,
      group: newRegistryUser.group,
      role: newRegistryUser.role,
    });
    expect(status).equal(200);
  });

  it('registry admin - should delete user', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      callFactory(
        'user:delete',
        { id: createdRegistryUserId },
        ['user.delete'],
      ));
    expect(status).equal(200);
  });
});
