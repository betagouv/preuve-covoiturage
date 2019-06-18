import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiNock from 'chai-nock';
import { Exceptions } from '@ilos/core';

import { FakeMongoServer } from './mongo/server';
import { MockFactory } from './mocks/factory';
import { UserBaseInterface } from '../src/interfaces/UserInterfaces';
import { aom, operators, registry } from '../src/config/permissions';

const fakeMongoServer = new FakeMongoServer();
const mockFactory = new MockFactory();
chai.use(chaiNock);
chai.use(chaiAsPromised);


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

let newAomUser;
let newOperatorUser;
let newRegistryUser;
let newRegistryAdmin;

let aomUserParams;
let operatorUserParams;
let registryUserParams;

describe('User service Creation', () => {
  before(async () => {
    aomUserParams = mockFactory.createUserParams('aom', 'user', { aom: '5cef990d133992029c1abe44' });
    operatorUserParams = mockFactory.createUserParams('operators', 'user', { operator: '5cef990d133992029c1abe41' });
    registryUserParams = mockFactory.createUserParams('registry', 'user');
  });
  it('registry admin - should create user registry', async () => {
    const { status: createStatus, data: createData } = await request.post(
      '/',
      mockFactory.call(
        'user:create',
        {
          ...registryUserParams,
        },
        {
        group: 'registry',
        role: 'admin',
        permissions: ['user.create'],
      }),
    );

    expect(createData.result).to.have.property('_id');
    delete createData.result._id;
    expect(createData.result).to.eql({
      ...registryUserParams,
      permissions: registry.user.permissions,
      status: 'notActive',
    });
    expect(createStatus).equal(200);
  });

  it('aom admin - should create user aom', async () => {
    const { status: createStatus, data: createData } = await request.post(
      '/',
      mockFactory.call(
        'user:create',
        {
          ...aomUserParams,
        },
        {
          group: aomUserParams.group,
          role: 'admin',
          permissions: ['aom.users.add'],
          aom: aomUserParams.aom,
        }),
    );
    expect(createData.result).to.have.property('_id');
    delete createData.result._id;
    expect(createData.result).to.eql({
      ...aomUserParams,
      permissions: aom.user.permissions,
      status: 'notActive',
    });
    expect(createStatus).equal(200);
  });

  it('operator admin - should create user operator', async () => {
    const { status: createStatus, data: createData } = await request.post(
      '/',
      mockFactory.call(
        'user:create', {
          ...operatorUserParams,
        },
        {
          group: aomUserParams.group,
          role: 'admin',
          permissions: ['operator.users.add'],
          operator: operatorUserParams.operator,
        }),
      );
    expect(createData.result).to.eql({
      ...operatorUserParams,
      permissions: operators.user.permissions,
      status: 'notActive',
    });
    expect(createStatus).equal(200);
  });
});

describe('User service Deletion', () => {
  before(async () => {
    newRegistryUser = await fakeMongoServer.addUser(mockFactory.newRegistryUserModel);
    newAomUser = await fakeMongoServer.addUser(mockFactory.newAomUserModel);
    newOperatorUser = await fakeMongoServer.addUser(mockFactory.newOperatorUserModel);
  });

  it('registry user - should delete his profile', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call(
        'user:delete',
        { id: newRegistryUser._id },
        {
          group: 'registry',
          role: 'admin',
          permissions: ['profile.delete'],
          _id: newRegistryUser._id,
        },
      ),
    );
    expect(status).equal(200);
  });

  it("registry user - shouldn't delete other profile", async () => {
    const response = await request.post(
      '/',
      mockFactory.call(
        'user:delete',
        { id: newAomUser._id },
        {
          group: 'registry',
          role: 'admin',
          permissions: ['profile.delete'],
          _id: newRegistryUser._id,
        },
      ),
    );
    expect(response).to.deep.include(mockFactory.error(new Exceptions.ForbiddenException('Invalid permissions')));
  });

  it('registry aom - should delete user from aom', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call(
        'user:delete',
        { id: newAomUser._id, aom: newAomUser.aom },
        {
          group: 'aom',
          role: 'admin',
          permissions: ['aom.users.delete'],
          aom: newAomUser.aom,
          _id: newAomUser._id,
        },
      ),
    );
    expect(status).equal(200);
  });

  it('registry operator - should delete user from opertor', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call(
        'user:delete',
        { id: newOperatorUser._id, operator: newOperatorUser.operator },
        {
          group: 'operator',
          role: 'admin',
          permissions: ['operator.users.delete'], operator: newAomUser.operator,
          _id: newOperatorUser._id,
        },
      ),
    );
    expect(status).equal(200);
  });
});

describe('User service Find', () => {
  before(async () => {
    newAomUser = await fakeMongoServer.addUser(mockFactory.newAomUserModel);
    newOperatorUser = await fakeMongoServer.addUser(mockFactory.newOperatorUserModel);
    newRegistryAdmin = await fakeMongoServer.addUser(mockFactory.newRegistryAdminModel);
    newRegistryUser = await fakeMongoServer.addUser(mockFactory.newRegistryUserModel);
  });

  after(async () => {
    fakeMongoServer.clearCollection();
  });

  it('registry admin - should find registry user', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call('user:find', { id: newRegistryUser._id }, {
        group: 'registry',
        role: 'admin',
        permissions: ['user.read'],
      }),
    );
    expect(data.result).to.eql({
      _id: newRegistryUser._id,
      ...mockFactory.newRegistryUserModel,
    });
    expect(status).equal(200);
  });

  it('registry user - should find his profile', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call(
        'user:find',
        { id: newRegistryUser._id },
        {
          group: 'registry',
          role: 'user',
          permissions: ['profile.read'],
          _id: newRegistryUser._id,
        },
      ),
    );

    expect(data.result).to.eql({
      _id: newRegistryUser._id,
      ...mockFactory.newRegistryUserModel,
    });
    expect(status).equal(200);
  });

  it('registry user - should not be able to find other profile', async () => {
    const response = await request.post(
      '/',
      mockFactory.call(
        'user:find',
        { id: newAomUser._id },
        {
          group: 'registry',
          role: 'user',
          permissions: ['profile.read'],
          _id: newRegistryUser._id,
        },
      ),
    );
    expect(response).to.deep.include(mockFactory.error(new Exceptions.ForbiddenException('Invalid permissions')));
  });

  it('registry admin - should find aom user', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call('user:find', { id: newAomUser._id },
        {
          group: 'registry',
          role: 'admin',
          permissions: ['user.read'],
        },
      ),
    );
    expect(data.result).to.eql({
      _id: newAomUser._id,
      ...mockFactory.newAomUserModel,
    });
    expect(status).equal(200);
  });

  it('registry admin - should find operator user', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call('user:find', { id: newOperatorUser._id }, {
        group: 'registry',
        role: 'admin',
        permissions: ['user.read'],
      }),
    );
    expect(data.result).to.eql({
      _id: newOperatorUser._id,
     ...mockFactory.newOperatorUserModel,
    });
    expect(status).equal(200);
  });

  it('aom admin - should find aom user', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call('user:find', { id: newAomUser._id, aom: newAomUser.aom },
        {
          group: 'aom',
          role: 'admin',
          permissions: ['aom.users.read'],
          aom: newAomUser.aom,
        }),
    );
    expect(data.result).to.eql({
      _id: newAomUser._id,
     ...mockFactory.newAomUserModel,
    });
    expect(status).equal(200);
  });

  it('operator admin - should find operator user', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call(
        'user:find',
        { id: newOperatorUser._id, operator: newOperatorUser.operator },
        {
          group:'registry',
          role: 'admin',
          permissions: ['operator.users.read'],
          operator: newOperatorUser.operator,
        },
      ),
    );
    expect(data.result).to.eql({
      _id: newOperatorUser._id,
     ...mockFactory.newOperatorUserModel,
    });
    expect(status).equal(200);
  });
});

describe('User service : List', () => {
  before(async () => {
    newRegistryUser = await fakeMongoServer.addUser(mockFactory.newRegistryUserModel);
    newAomUser = await fakeMongoServer.addUser(mockFactory.newAomUserModel);
    newOperatorUser = await fakeMongoServer.addUser(mockFactory.newOperatorUserModel);
    newRegistryAdmin = await fakeMongoServer.addUser(mockFactory.newRegistryAdminModel);
  });

  after(async () => {
    fakeMongoServer.clearCollection();
  });


  it('registry admin - should list users', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call('user:list', {}, {
        group: 'registry',
        role: 'admin',
        permissions: ['user.list'],
      }),
    );
    expect(data.result.data[0]).to.eql({
      _id: newRegistryUser._id,
      ...mockFactory.newRegistryUserModel,
    });
    expect(data.result.data[1]).to.eql({
      _id: newAomUser._id,
      ...mockFactory.newAomUserModel,
    });
    expect(data.result.data[2]).to.eql({
      _id: newOperatorUser._id,
      ...mockFactory.newOperatorUserModel,
    });
    expect(status).equal(200);
  });

  it('aom admin - should list aom users', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call('user:list', { aom: newAomUser.aom }, {
        group: 'aom',
        role:'admin',
        permissions: ['aom.users.list'],
        aom: newAomUser.aom,
      }),
    );

    expect(data.result.data[0]).to.eql({
      _id: newAomUser._id,
      ...mockFactory.newAomUserModel,
    });
    expect(status).equal(200);
  });

  it('operator admin - should list operator users', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call('user:list', { operator: newOperatorUser.operator },
        {
          group: 'operators',
          role: 'admin',
          permissions: ['operator.users.list'],
          operator: newOperatorUser.operator,
      }),
    );

    expect(data.result.data[0]).to.eql({
      _id: newOperatorUser._id,
      ...mockFactory.newOperatorUserModel,
    });
    expect(status).equal(200);
  });
});

describe('USER SERVICE : Patch', () => {
  before(async () => {
    newAomUser = await fakeMongoServer.addUser(mockFactory.newAomUserModel);
    newOperatorUser = await fakeMongoServer.addUser(mockFactory.newOperatorUserModel);
    newRegistryAdmin = await fakeMongoServer.addUser(mockFactory.newRegistryAdminModel);
    newRegistryUser = await fakeMongoServer.addUser(mockFactory.newRegistryUserModel);
  });

  after(async () => {
    fakeMongoServer.clearCollection();
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
        {
          group: 'registry',
          role: 'admin',
          permissions: ['user.update'],
        },
      ),
    );
    expect(data.result).to.eql({
      _id: newRegistryUser._id,
      ...mockFactory.newRegistryUserModel,
      ...mockUpdatedProperties,
    });
    expect(status).equal(200);
  });

  it('registry user - should patch his profile', async () => {
    const mockUpdatedProperties = {
      firstname: 'johnny2',
      lastname: 'smith2',
    };

    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call(
        'user:patch',
        {
          id: newRegistryUser._id,
          patch: mockUpdatedProperties,
        },
        {
          group: 'registry',
          role: 'user',
          permissions: ['profile.update'],
          _id: newRegistryUser._id,
        },
      ),
    );
    expect(data.result).to.eql({
      _id: newRegistryUser._id,
      ...mockFactory.newRegistryUserModel,
      ...mockUpdatedProperties,
    });
    expect(status).equal(200);
  });

  it("registry user - shouldn't patch other profile", async () => {
    const mockUpdatedProperties = {
      firstname: 'johnny3',
      lastname: 'smith3',
    };

    const response = await request.post(
      '/',
      mockFactory.call(
        'user:patch',
        {
          id: newAomUser._id,
          patch: mockUpdatedProperties,
        },
        {
          group: 'registry',
          role: 'user',
          permissions: ['profile.update'],
          _id: newRegistryUser._id,
        },
      ),
    );
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
          patch: mockUpdatedProperties,
        },
        {
          group: 'aom',
          role: 'admin',
          permissions: ['aom.users.update'],
          aom: newAomUser.aom,
          _id: newAomUser._id,
        },
      ),
    );
    expect(data.result).to.eql({
      _id: newAomUser._id,
      ...mockFactory.newAomUserModel,
      ...mockUpdatedProperties,
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
          patch: mockUpdatedProperties,
        },
        {
          group: 'operator',
          role: 'admin',
          permissions: ['operator.users.update'],
          operator: newOperatorUser.operator,
          _id: newOperatorUser._id,
        },
      ),
    );
    expect(data.result).to.eql({
      _id: newOperatorUser._id,
      ...mockFactory.newOperatorUserModel,
      ...mockUpdatedProperties,
    });
    expect(status).equal(200);
  });
});


describe('USER SERVICE : change Password', () => {
  before(async () => {
    newAomUser = await fakeMongoServer.addUser(mockFactory.newAomUserModel);
    newOperatorUser = await fakeMongoServer.addUser(mockFactory.newOperatorUserModel);
    newRegistryAdmin = await fakeMongoServer.addUser(mockFactory.newRegistryAdminModel);
    newRegistryUser = await fakeMongoServer.addUser({
      ...mockFactory.newRegistryUserModel,
      password: 'passwordRegistryUser',
    });
  });

  after(async () => {
    fakeMongoServer.clearCollection();
  });

  const newPassword = 'newPassword';
  it('registry admin - should change password', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call(
        'user:changePassword',
        {
          newPassword,
          oldPassword: 'passwordRegistryUser',
        },
        {
          group: 'registry',
          role: 'admin',
          permissions: ['profile.update'],
          _id: newRegistryUser._id,
        },
      ),
    );
    expect(data.result).to.eql({
      _id: newRegistryUser._id,
      ...mockFactory.newRegistryUserModel,
    });
    expect(status).equal(200);
  });

  it("registry admin - shouldn't change password with wrong old password", async () => {
    const response = await request.post(
      '/',
      mockFactory.call(
        'user:changePassword',
        {
          newPassword,
          oldPassword: 'wrongPassword',
        },
        {
          group: 'registry',
          role: 'admin',
          permissions: ['profile.update'],
          _id: newRegistryUser._id,
        },
      ),
    );
    expect(response).to.deep.include(mockFactory.error(new Exceptions.ForbiddenException('Wrong credentials')));
  });
});

describe('USER SERVICE : change Email', () => {
  before(async () => {
    newAomUser = await fakeMongoServer.addUser(mockFactory.newAomUserModel);
    newOperatorUser = await fakeMongoServer.addUser(mockFactory.newOperatorUserModel);
    newRegistryAdmin = await fakeMongoServer.addUser(mockFactory.newRegistryAdminModel);
    newRegistryUser = await fakeMongoServer.addUser(mockFactory.newRegistryUserModel);
  });

  after(async () => {
    fakeMongoServer.clearCollection();
  });

  const newEmail = 'newEmail@example.com';
  it('registry admin - should change email registry user', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call(
        'user:changeEmail',
        {
          id: newRegistryUser._id,
          email: newEmail,
        },
        {
          group: 'registry',
          role: 'admin',
          permissions: ['user.update'],
        },
      ),
    );
    expect(data.result).to.eql({
      _id: newRegistryUser._id,
      ...mockFactory.newRegistryUserModel,
      status: 'notActive',
      email: newEmail,
    });
    expect(status).equal(200);
  });
});

/*
 * LOGIN
 */
describe('User service : Login', () => {
  before(async () => {
    newRegistryAdmin = await fakeMongoServer.addUser(
      {
        ...mockFactory.newRegistryAdminModel,
        password: 'password',
        status : 'active',
      });
  });

  after(async () => {
    fakeMongoServer.clearCollection();
  });

  it('registry admin - should login', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call(
        'user:login',
        {
          email: newRegistryAdmin.email,
          password: 'password',
        },
        {
          group: 'registry',
          role: 'admin',
          permissions: [] },
      ),
    );
    expect(data.result).to.eql({
      _id: newRegistryAdmin._id,
      ...mockFactory.newRegistryAdminModel,
      status: 'active',
    });
    expect(status).equal(200);
  });
});


// todo:
// 'permission "aom.users.update" shouldn\'t change role of other aom user - reject with not found ?'
