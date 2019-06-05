// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiNock from 'chai-nock';
import { bootstrap, Exceptions } from '@pdc/core';
import { FakeMongoServer } from './mongo/server';
import { MockFactory } from './mocks/factory';


const fakeMongoServer = new FakeMongoServer();
const mockFactory = new MockFactory();

chai.use(chaiNock);

const { expect } = chai;


let request;
const newAomUserModel = mockFactory.newUser('aom', 'user', { aom: '5cef990d133992029c1abe44' });
const newOperatorUserModel = mockFactory.newUser('operators', 'user', { operator: '5cef990d133992029c1abe41' });
const newRegistryAdminModel = mockFactory.newUser();
const newRegistryUserModel = mockFactory.newUser('registry', 'user');

let newAomUser;
let newOperatorUser;
let newRegistryAdmin;
let newRegistryUser;

describe('User service', () => {
  before(async () => {
    request = await fakeMongoServer.start();
    newAomUser = fakeMongoServer.addUser(newAomUserModel);
    newOperatorUser = fakeMongoServer.addUser(newOperatorUserModel);
    newRegistryAdmin = fakeMongoServer.addUser(newRegistryAdminModel);
    newRegistryUser = fakeMongoServer.addUser(newRegistryUserModel);
  });

  after(async () => {
    request = await fakeMongoServer.stop();
  });


  it('registry admin - should find registry user', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call(
      'user:find',
      { id: newRegistryUser._id },
      'registry',
      'admin',
      { permissions: ['user.read'] },
    ));
    expect(data.result).to.include({
      _id: newRegistryUser._id,
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
      mockFactory.call(
        'user:find',
        { id: newRegistryUser._id },
        'registry',
        'user',
        { permissions: ['profile.read'] },
        newRegistryUser._id,
      ));
    expect(data.result).to.include({
      _id: newRegistryUser._id,
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
      mockFactory.call(
        'user:find',
        { id: newAomUser ._id },
        'registry',
        'user',
        { permissions: ['profile.read'] },
        newRegistryUser._id,
      ));
    expect(response).to.deep.include(mockFactory.error(new Exceptions.ForbiddenException('Invalid permissions')));
  });

  it('registry admin - should find aom user', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call(
        'user:find',
        { id: newAomUser ._id },
        'registry',
        'admin',
        { permissions: ['user.read'] },
      ));
    expect(data.result).to.include({
      _id: newAomUser._id,
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
      mockFactory.call(
        'user:find',
        { id: newOperatorUser ._id },
        'registry',
        'admin',
        { permissions: ['user.read'] },
      ));
    expect(data.result).to.include({
      _id: newOperatorUser._id,
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
      mockFactory.call(
        'user:find',
        { id: newAomUser._id, aom: newAomUser.aom },
        'aom',
        'admin',
        { permissions: ['aom.users.read'], aom: newAomUser.aom },
      ));
    expect(data.result).to.include({
      _id: newAomUser._id,
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
      mockFactory.call(
        'user:find',
        { id: newOperatorUser._id, operator: newOperatorUser.operator },
        'registry',
        'admin',
        { permissions: ['operator.users.read'], operator: newOperatorUser.operator },
      ));
    expect(data.result).to.include({
      _id: newOperatorUser._id,
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
});
