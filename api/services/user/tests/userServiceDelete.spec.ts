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

const newAomUserModel = mockFactory.newUser('aom', 'user', { aom: '5cef990d133992029c1abe44' });
const newOperatorUserModel = mockFactory.newUser('operators', 'user', { operator: '5cef990d133992029c1abe41' });
// const newRegistryAdminModel = mockFactory.newUser();
const newRegistryUserModel = mockFactory.newUser('registry', 'user');

let request;
let newAomUser;
let newOperatorUser;
// let newRegistryAdmin;
let newRegistryUser;


describe('User service', () => {
  before(async () => {
    request = await fakeMongoServer.start();
    newAomUser = await fakeMongoServer.addUser(newAomUserModel);
    newOperatorUser = await fakeMongoServer.addUser(newOperatorUserModel);
    // newRegistryAdmin = await fakeMongoServer.addUser(newRegistryAdminModel);
    newRegistryUser = await fakeMongoServer.addUser(newRegistryUserModel);
  });

  after(async () => {
    request = await fakeMongoServer.stop();
  });


  it('registry admin - should delete user', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call(
        'user:delete',
        { id: newRegistryUser._id },
        'registry',
        'admin',
        { permissions: ['user.delete'] },
      ));
    expect(status).equal(200);
  });

  it('registry user - should delete his profile', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call(
        'user:delete',
        { id: newRegistryUser._id },
        'registry',
        'admin',
        { permissions: ['profile.delete'] },
        newRegistryUser._id,
      ));
    expect(status).equal(200);
  });

  it('registry user - shouldn\'t delete other profile', async () => {
    const response = await request.post(
      '/',
      mockFactory.call(
        'user:delete',
        { id: newAomUser._id },
        'registry',
        'admin',
        { permissions: ['profile.delete'] },
        newRegistryUser._id,
      ));
    expect(response).to.deep.include(mockFactory.error(new Exceptions.ForbiddenException('Invalid permissions')));
  });

  it('registry aom - should delete user from aom', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call(
        'user:delete',
        { id: newAomUser._id, aom: newAomUser.aom },
        'aom',
        'admin',
        { permissions: ['aom.users.delete'], aom: newAomUser.aom },
        newAomUser._id,
      ));
    expect(status).equal(200);
  });

  it('registry operator - should delete user from opertor', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call(
        'user:delete',
        { id: newOperatorUser._id, operator: newOperatorUser.operator },
        'operator',
        'admin',
        { permissions: ['operator.users.delete'], operator: newAomUser.operator },
        newOperatorUser._id,
      ));
    expect(status).equal(200);
  });
});
