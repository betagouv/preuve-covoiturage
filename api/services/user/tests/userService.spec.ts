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


const errorFactory = (err: Exceptions.RPCException) => ({
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
});

const mockConnectedUserBase = {
  email: 'admin@example.com',
  firstname: 'admin',
  lastname: 'admin',
  fullname: 'admin admin',
  phone: '0622222233',
};

const callFactory = (method: string, data: any,
                     group:string = 'registry',
                     role:string = 'admin',
                     userparams: {
                       permissions: string[],
                       aom?:string,
                       operator?:string,
                     } = { permissions : [] },
                     _id:string = 'fakeId') => ({
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
                             user: { ...mockConnectedUserBase, group, role, _id, ...userparams },
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
  const newAomUser = newUserFactory('aom', 'user', { aom: '5cef990d133992029c1abe44' });
  const newOperatorUser = newUserFactory('operators', 'user', { operator: '5cef990d133992029c1abe41' });
  const newRegistryAdmin = newUserFactory();
  const newRegistryUser = newUserFactory('registry', 'user');


  let createdRegistryUserId;
  let createdAomUserId;
  let createdOperatorUserId;


  /*
  CREATION ------------
   */
  it('registry admin - should create user registry', async () => {
    const { status: createStatus, data: createData } = await request.post(
      '/',
      callFactory(
        'user:create',
        newRegistryUser,
        'registry',
        'admin',
        { permissions: ['user.create'] },
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
        newAomUser.group,
        'admin',
        { permissions: ['aom.users.add'], aom: newAomUser.aom },
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
        newOperatorUser.group,
        'admin',
        { permissions: ['operator.users.add'], operator: newOperatorUser.operator },
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


  /*
  FIND  --------------------
   */
  it('registry admin - should find registry user', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      callFactory(
      'user:find',
      { id: createdRegistryUserId },
      'registry',
      'admin',
      { permissions: ['user.read'] },
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

  it('registry user - should find his profile', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      callFactory(
        'user:find',
        { id: createdRegistryUserId },
        'registry',
        'user',
        { permissions: ['profile.read'] },
        createdRegistryUserId,
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

  it('registry user - should not be able to find other profile', async () => {
    const response = await request.post(
      '/',
      callFactory(
        'user:find',
        { id: createdAomUserId },
        'registry',
        'user',
        { permissions: ['profile.read'] },
        createdRegistryUserId,
      ));
    expect(response).to.deep.include(errorFactory(new Exceptions.ForbiddenException('Invalid permissions')));
  });

  it('registry admin - should find aom user', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      callFactory(
        'user:find',
        { id: createdAomUserId },
        'registry',
        'admin',
        { permissions: ['user.read'] },
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
        'registry',
        'admin',
        { permissions: ['user.read'] },
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

  it('aom admin - should find aom user', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      callFactory(
        'user:find',
        { id: createdAomUserId, aom: newAomUser.aom },
        'aom',
        'admin',
        { permissions: ['aom.users.read'], aom: newAomUser.aom },
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

  it('operator admin - should find operator user', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      callFactory(
        'user:find',
        { id: createdOperatorUserId, operator: newOperatorUser.operator },
        'registry',
        'admin',
        { permissions: ['operator.users.read'], operator: newOperatorUser.operator },
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

  /*
   LIST -------------------------------
   */
  it('registry admin - should list users', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      callFactory(
        'user:list',
        {},
        'registry',
        'admin',
        { permissions:['user.list'] },
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

  it('aom admin - should list aom users', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      callFactory(
        'user:list',
        { aom: newAomUser.aom },
        'aom',
        'admin',
        { permissions:['aom.users.list'], aom: newAomUser.aom },
      ));
    console.log(data);
    expect(data.result.data[0]).to.include({
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

  it('operator admin - should list operator users', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      callFactory(
        'user:list',
        { operator: newOperatorUser.operator },
        'operators',
        'admin',
        { permissions:['operator.users.list'], operator: newOperatorUser.operator },
      ));
    expect(data.result.data[0]).to.include({
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


  /*
  PATCH -------------------------
   */
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
        'registry',
        'admin',
        { permissions: ['user.update'] },
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

  it('registry user - should patch his profile', async () => {
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
        'registry',
        'user',
        { permissions: ['profile.update'] },
        createdRegistryUserId,
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

  it('registry user - shouldn\'t patch other profile', async () => {
    const mockUpdatedProperties = {
      firstname: 'johnny',
      lastname: 'smith',
    };

    const response = await request.post(
      '/',
      callFactory(
        'user:patch',
        {
          id: createdAomUserId,
          patch: mockUpdatedProperties,
        },
        'registry',
        'user',
        { permissions: ['profile.update'] },
        createdRegistryUserId,
      ));
    expect(response).to.deep.include(errorFactory(new Exceptions.ForbiddenException('Invalid permissions')));
  });

  it('aom admin - should patch aom user', async () => {
    const mockUpdatedProperties = {
      firstname: 'samuel',
      lastname: 'goldschmidt',
    };

    const { status: status, data: data } = await request.post(
      '/',
      callFactory(
        'user:patch',
        {
          id: createdAomUserId,
          aom: newAomUser.aom,
          patch: mockUpdatedProperties,
        },
        'aom',
        'admin',
        { permissions: ['aom.users.update'], aom: newAomUser.aom },
        createdAomUserId,
      ));
    expect(data.result).to.include({
      _id: createdAomUserId,
      email: newAomUser.email,
      firstname: mockUpdatedProperties.firstname,
      lastname: mockUpdatedProperties.lastname,
      phone: newAomUser.phone,
      group: newAomUser.group,
      role: newAomUser.role,
      aom: newAomUser.aom,
    });
    expect(status).equal(200);
  });

  it('operator admin - should patch operator user', async () => {
    const mockUpdatedProperties = {
      firstname: 'samuel',
      lastname: 'goldschmidt',
    };

    const { status: status, data: data } = await request.post(
      '/',
      callFactory(
        'user:patch',
        {
          id: createdOperatorUserId,
          operator: newOperatorUser.operator,
          patch: mockUpdatedProperties,
        },
        'operator',
        'admin',
        { permissions: ['operator.users.update'], operator: newOperatorUser.operator },
        createdOperatorUserId,
      ));
    expect(data.result).to.include({
      _id: createdOperatorUserId,
      email: newOperatorUser.email,
      firstname: mockUpdatedProperties.firstname,
      lastname: mockUpdatedProperties.lastname,
      phone: newOperatorUser.phone,
      group: newOperatorUser.group,
      role: newOperatorUser.role,
    });
    expect(status).equal(200);
  });


  /*
  DELETION  -------------------------
   */
  it('registry admin - should delete user', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      callFactory(
        'user:delete',
        { id: createdRegistryUserId },
        'registry',
        'admin',
        { permissions: ['user.delete'] },
      ));
    expect(status).equal(200);
  });

  it('registry user - should delete his profile', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      callFactory(
        'user:delete',
        { id: createdRegistryUserId },
        'registry',
        'admin',
        { permissions: ['profile.delete'] },
        createdRegistryUserId,
      ));
    expect(status).equal(200);
  });

  it('registry user - shouldn\'t delete other profile', async () => {
    const response = await request.post(
      '/',
      callFactory(
        'user:delete',
        { id: createdAomUserId },
        'registry',
        'admin',
        { permissions: ['profile.delete'] },
        createdRegistryUserId,
      ));
    expect(response).to.deep.include(errorFactory(new Exceptions.ForbiddenException('Invalid permissions')));
  });

  it('registry aom - should delete user from aom', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      callFactory(
        'user:delete',
        { id: createdAomUserId, aom: newAomUser.aom },
        'aom',
        'admin',
        { permissions: ['aom.users.delete'], aom: newAomUser.aom },
        createdAomUserId,
      ));
    expect(status).equal(200);
  });

  it('registry operator - should delete user from opertor', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      callFactory(
        'user:delete',
        { id: createdOperatorUserId, operator: newOperatorUser.operator },
        'operator',
        'admin',
        { permissions: ['operator.users.delete'], operator: newAomUser.operator },
        createdOperatorUserId,
      ));
    expect(status).equal(200);
  });
});
