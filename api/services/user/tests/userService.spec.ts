import chai from 'chai';
import chaiNock from 'chai-nock';
import { Exceptions } from '@pdc/core';

import { FakeMongoServer } from './mongo/server';
import { MockFactory } from './mocks/factory';

const fakeMongoServer = new FakeMongoServer();
const mockFactory = new MockFactory();
chai.use(chaiNock);

const { expect } = chai;


before(async () => {
  await fakeMongoServer.startServer();
  await fakeMongoServer.startTransport();
});

after(async () => {
  await fakeMongoServer.stopServer();
  await fakeMongoServer.stopTransport();
});


const request = mockFactory.request();

describe('User service Creation', () => {
  const newAomUser = mockFactory.newUser('aom', 'user', { aom: '5cef990d133992029c1abe44' });
  const newOperatorUser = mockFactory.newUser('operators', 'user', { operator: '5cef990d133992029c1abe41' });
  const newRegistryUser = mockFactory.newUser('registry', 'user');


  it('registry admin - should create user registry', async () => {
    const { status: createStatus, data: createData } = await request.post(
      '/',
      mockFactory.call(
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
  });

  it('aom admin - should create user aom', async () => {
    const { status: createStatus, data: createData } = await request.post(
      '/',
      mockFactory.call(
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
  });

  it('operator admin - should create user operator', async () => {
    const { status: createStatus, data: createData } = await request.post(
      '/',
      mockFactory.call(
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
  });
});


describe('User service Deletion', () => {
  let newAomUser;
  let newOperatorUser;
  let newRegistryUser;

  const newAomUserModel = mockFactory.newUser('aom', 'user', { aom: '5cef990d133992029c1abe44' });
  const newOperatorUserModel = mockFactory.newUser('operators', 'user', { operator: '5cef990d133992029c1abe41' });
  const newRegistryUserModel = mockFactory.newUser('registry', 'user');

  before(async () => {
    newRegistryUser = await fakeMongoServer.addUser(newRegistryUserModel);
    newAomUser = await fakeMongoServer.addUser(newAomUserModel);
    newOperatorUser = await fakeMongoServer.addUser(newOperatorUserModel);
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


describe('User service Find', () => {
  const newAomUserModel = mockFactory.newUser('aom', 'user', { aom: '5cef990d133992029c1abe44' });
  const newOperatorUserModel = mockFactory.newUser('operators', 'user', { operator: '5cef990d133992029c1abe41' });
  const newRegistryAdminModel = mockFactory.newUser();
  const newRegistryUserModel = mockFactory.newUser('registry', 'user');

  let newAomUser;
  let newOperatorUser;
  let newRegistryAdmin;
  let newRegistryUser;

  before(async () => {
    newAomUser = await fakeMongoServer.addUser(newAomUserModel);
    newOperatorUser = await fakeMongoServer.addUser(newOperatorUserModel);
    newRegistryAdmin = await fakeMongoServer.addUser(newRegistryAdminModel);
    newRegistryUser = await fakeMongoServer.addUser(newRegistryUserModel);
  });

  after(async() => {
    fakeMongoServer.clearCollection();
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
      ),
    );

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
        { id: newAomUser._id },
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
        { id: newAomUser._id },
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
        { id: newOperatorUser._id },
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

describe('User service : List', () => {
  const newAomUserModel = mockFactory.newUser('aom', 'user', { aom: '5cef990d133992029c1abe44' });
  const newOperatorUserModel = mockFactory.newUser('operators', 'user', { operator: '5cef990d133992029c1abe41' });
  const newRegistryAdminModel = mockFactory.newUser();
  const newRegistryUserModel = mockFactory.newUser('registry', 'user');

  let newAomUser;
  let newOperatorUser;
  let newRegistryAdmin;
  let newRegistryUser;


  before(async () => {
    newRegistryUser = await fakeMongoServer.addUser(newRegistryUserModel);
    newAomUser = await fakeMongoServer.addUser(newAomUserModel);
    newOperatorUser = await fakeMongoServer.addUser(newOperatorUserModel);
    newRegistryAdmin = await fakeMongoServer.addUser(newRegistryAdminModel);
  });

  it('registry admin - should list users', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call(
        'user:list',
        {},
        'registry',
        'admin',
        { permissions: ['user.list'] },
      ));
    expect(data.result.data[0]).to.include({
      _id: newRegistryUser._id,
      email: newRegistryUser.email,
      firstname: newRegistryUser.firstname,
      lastname: newRegistryUser.lastname,
      phone: newRegistryUser.phone,
      group: newRegistryUser.group,
      role: newRegistryUser.role,
    });
    expect(data.result.data[1]).to.include({
      _id: newAomUser._id,
      email: newAomUser.email,
      firstname: newAomUser.firstname,
      lastname: newAomUser.lastname,
      phone: newAomUser.phone,
      group: newAomUser.group,
      role: newAomUser.role,
      aom: newAomUser.aom,
    });
    expect(data.result.data[2]).to.include({
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

  it('aom admin - should list aom users', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call(
        'user:list',
        { aom: newAomUser.aom },
        'aom',
        'admin',
        { permissions: ['aom.users.list'], aom: newAomUser.aom },
      ),
    );

    expect(data.result.data[0]).to.include({
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

  it('operator admin - should list operator users', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call(
        'user:list',
        { operator: newOperatorUser.operator },
        'operators',
        'admin',
        { permissions: ['operator.users.list'], operator: newOperatorUser.operator },
      ),
    );

    expect(data.result.data[0]).to.include({
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


describe('User service : Patch', () => {
  const newAomUserModel = mockFactory.newUser('aom', 'user', { aom: '5cef990d133992029c1abe44' });
  const newOperatorUserModel = mockFactory.newUser('operators', 'user', { operator: '5cef990d133992029c1abe41' });
  const newRegistryAdminModel = mockFactory.newUser();
  const newRegistryUserModel = mockFactory.newUser('registry', 'user');

  let newAomUser;
  let newOperatorUser;
  let newRegistryAdmin;
  let newRegistryUser;

  before(async () => {
    newAomUser = await fakeMongoServer.addUser(newAomUserModel);
    newOperatorUser = await fakeMongoServer.addUser(newOperatorUserModel);
    newRegistryAdmin = await fakeMongoServer.addUser(newRegistryAdminModel);
    newRegistryUser = await fakeMongoServer.addUser(newRegistryUserModel);
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
          patch: { newPassword, oldPassword: newRegistryUserModel.password },
        },
        'registry',
        'admin',
        { permissions: ['user.update'] },
      ));
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
          patch: { newPassword, oldPassword: `wrong${newRegistryUserModel.password}` },
        },
        'registry',
        'admin',
        { permissions: ['user.update'] },
    ),
  );
    expect(response).to.deep.include(mockFactory.error(new Exceptions.ForbiddenException('Wrong credentials')));
  });


  /*
  CHANGE EMAIL
   */
  const newEmail = 'newEmail@example.com';
  it('registry admin - should change email registry user', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call(
        'user:patch',
        {
          id: newRegistryUser._id,
          patch: { email: newEmail },
        },
        'registry',
        'admin',
        { permissions: ['user.update'] },
      ));
    expect(data.result).to.include({
      email: newEmail,
    });
    expect(status).equal(200);
  });
});
