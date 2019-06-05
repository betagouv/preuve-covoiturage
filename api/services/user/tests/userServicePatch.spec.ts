// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiNock from 'chai-nock';
import { bootstrap, Exceptions } from '@pdc/core';
import { mockNewUserBase } from './mocks/newUserBase';
import { FakeMongoServer } from './mongo/server';
import { MockFactory } from './mocks/factory';
import { CryptoProvider } from '@pdc/provider-crypto';


const fakeMongoServer = new FakeMongoServer();
const mockFactory = new MockFactory();

chai.use(chaiNock);

const { expect } = chai;


const newAomUserModel = mockFactory.newUser('aom', 'user', { aom: '5cef990d133992029c1abe44' });
const newOperatorUserModel = mockFactory.newUser('operators', 'user', { operator: '5cef990d133992029c1abe41' });
const newRegistryAdminModel = mockFactory.newUser();
const newRegistryUserModel = mockFactory.newUser('registry', 'user');

let newAomUser;
let newOperatorUser;
let newRegistryAdmin;
let newRegistryUser;
let hashedCurrentPassword;

let request;

describe('User service', () => {
  before(async () => {
    request = await fakeMongoServer.start();
    hashedCurrentPassword = await new CryptoProvider().cryptPassword(mockNewUserBase.password);
    newAomUser = fakeMongoServer.addUser(newAomUserModel);
    newOperatorUser = fakeMongoServer.addUser(newOperatorUserModel);
    newRegistryAdmin = fakeMongoServer.addUser(newRegistryAdminModel);
    newRegistryUser = fakeMongoServer.addUser(newRegistryUserModel);
  });

  after(async () => {
    request = await fakeMongoServer.stop();
  });


  it('registry admin - should patch registry user', async () => {
    const mockUpdatedProperties = {
      firstname: 'johnny',
      lastname: 'smith',
    };

    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call(
        'user:patch',
        {
          id: newRegistryUser._id,
          patch: mockUpdatedProperties,
        },
        'registry',
        'admin',
        { permissions: ['user.update'] },
      ));
    expect(data.result).to.include({
      _id: newRegistryUser._id,
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
      mockFactory.call(
        'user:patch',
        {
          id: newRegistryUser._id,
          patch: mockUpdatedProperties,
        },
        'registry',
        'user',
        { permissions: ['profile.update'] },
        newRegistryUser._id,
      ));
    expect(data.result).to.include({
      _id: newRegistryUser._id,
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
      mockFactory.call(
        'user:patch',
        {
          id: newAomUser._id,
          patch: mockUpdatedProperties,
        },
        'registry',
        'user',
        { permissions: ['profile.update'] },
        newRegistryUser._id,
      ));
    expect(response).to.deep.include(mockFactory.error(new Exceptions.ForbiddenException('Invalid permissions')));
  });

  it('aom admin - should patch aom user', async () => {
    const mockUpdatedProperties = {
      firstname: 'samuel',
      lastname: 'goldschmidt',
    };

    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call(
        'user:patch',
        {
          id: newAomUser._id,
          aom: newAomUser.aom,
          patch: mockUpdatedProperties,
        },
        'aom',
        'admin',
        { permissions: ['aom.users.update'], aom: newAomUser.aom },
        newAomUser._id,
      ));
    expect(data.result).to.include({
      _id: newAomUser._id,
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
      mockFactory.call(
        'user:patch',
        {
          id: newOperatorUser._id,
          operator: newOperatorUser.operator,
          patch: mockUpdatedProperties,
        },
        'operator',
        'admin',
        { permissions: ['operator.users.update'], operator: newOperatorUser.operator },
        newOperatorUser._id,
      ));
    expect(data.result).to.include({
      _id: newOperatorUser._id,
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
  CHANGE PASSWORD
   */
  const newPassword = 'newPassword';
  it('registry admin - should change password registry user', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call(
        'user:patch',
        {
          id: newRegistryUser._id,
          password: hashedCurrentPassword,
          patch: { newPassword, oldPassword: newRegistryUser.password },
        },
        'registry',
        'admin',
        { permissions: ['user.update'] },
      ));
    console.log(data.data);
    expect(data.result).to.include({
      _id: newRegistryUser._id,
      email: newRegistryUser.email,
      phone: newRegistryUser.phone,
      group: newRegistryUser.group,
      role: newRegistryUser.role,
    });
    expect(status).equal(200);
  });

  it('registry admin - shouldn\'t change password registry user - wrong old password', async () => {
    const response = await request.post(
      '/',
      mockFactory.call(
        'user:patch',
        {
          id: newRegistryUser._id,
          password: hashedCurrentPassword,
          patch: { newPassword, oldPassword: `wrong${newRegistryUser.password}` },
        },
        'registry',
        'admin',
        { permissions: ['user.update'] },
    ),
  );
    expect(response).to.deep.include(mockFactory.error(new Exceptions.ForbiddenException('Wrong credentials')));
  });
});
