import chai from 'chai';
import nock from 'nock';
import supertest from 'supertest';
import chaiNock from 'chai-nock';
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';

import { FakeMongoServer } from './mongo/server';
import { MockFactory } from './mocks/factory';
import { territories, operators, registry } from '../src/config/permissions';

const mockServer = new FakeMongoServer();
const mockFactory = new MockFactory();

chai.use(chaiAsPromised);
chai.use(chaiNock);

const { expect } = chai;

let superRequest;
let nockRequest;

const request = mockFactory.request();

let newTerritoryUser;
let newOperatorUser;
let newRegistryUser;
let newRegistryAdmin;

let territoryUserParams;
let operatorUserParams;
let registryUserParams;
describe('USER SERVICE', () => {
  before(async () => {
    await mockServer.startServer();
    await mockServer.startTransport();
    superRequest = supertest(mockServer.server);
  });

  after(async () => {
    await mockServer.stopServer();
    await mockServer.stopTransport();
  });

  beforeEach(() => {
    nockRequest = nock(/mailjet/)
      .post(/send/, (_body) => true)
      .reply(200);
  });

  afterEach(() => {
    nock.cleanAll();
  });
  describe('Creation', () => {
    before(async () => {
      territoryUserParams = mockFactory.createUserParams('territories', 'user', {
        territory: '5cef990d133992029c1abe44',
      });
      operatorUserParams = mockFactory.createUserParams('operators', 'user', { operator: '5cef990d133992029c1abe41' });
      registryUserParams = mockFactory.createUserParams('registry', 'user');
    });

    it('registry admin - should create user registry', async () => {
      nockRequest.on('request', (req, interceptor, body) => {
        expect(body).to.include(registryUserParams.email);
        expect(body).to.include('reset-password');
      });

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
          },
        ),
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

    it('territory admin - should create user territory', async () => {
      nockRequest.on('request', (req, interceptor, body) => {
        expect(body).to.include(territoryUserParams.email);
        expect(body).to.include('reset-password');
      });

      const { status: createStatus, data: createData } = await request.post(
        '/',
        mockFactory.call(
          'user:create',
          {
            ...territoryUserParams,
          },
          {
            group: territoryUserParams.group,
            role: 'admin',
            permissions: ['territory.users.add'],
            territory: territoryUserParams.territory,
          },
        ),
      );

      expect(createData.result).to.have.property('_id');
      delete createData.result._id;
      expect(createData.result).to.eql({
        ...territoryUserParams,
        permissions: territories.user.permissions,
        status: 'notActive',
      });
      expect(createStatus).equal(200);
    });

    it('operator admin - should create user operator', async () => {
      nockRequest.on('request', (req, interceptor, body) => {
        expect(body).to.include(operatorUserParams.email);
        expect(body).to.include('reset-password');
      });

      const { status: createStatus, data: createData } = await request.post(
        '/',
        mockFactory.call(
          'user:create',
          {
            ...operatorUserParams,
          },
          {
            group: territoryUserParams.group,
            role: 'admin',
            permissions: ['operator.users.add'],
            operator: operatorUserParams.operator,
          },
        ),
      );

      expect(createData.result).to.have.property('_id');
      delete createData.result._id;
      expect(createData.result).to.eql({
        ...operatorUserParams,
        permissions: operators.user.permissions,
        status: 'notActive',
      });
      expect(createStatus).equal(200);
    });
  });

  describe('Deletion', () => {
    before(async () => {
      newRegistryUser = await mockServer.addUser(mockFactory.newRegistryUserModel);
      newTerritoryUser = await mockServer.addUser(mockFactory.newTerritoryUserModel);
      newOperatorUser = await mockServer.addUser(mockFactory.newOperatorUserModel);
    });

    it('registry user - should delete his profile', async () => {
      const { status, data } = await request.post(
        '/',
        mockFactory.call(
          'user:delete',
          { _id: newRegistryUser._id },
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
      const payload = mockFactory.call(
        'user:delete',
        { _id: newTerritoryUser._id },
        {
          group: 'registry',
          role: 'admin',
          permissions: ['profile.delete'],
          _id: newRegistryUser._id,
        },
      );

      superRequest
        .post('/')
        .send(payload)
        .set('Accept', 'application/json')
        .expect((response) => {
          expect(response.status).to.eq(403);
          expect(response.body).to.have.property('error');
        });
    });

    it('registry territory - should delete user from territory', async () => {
      const payload = mockFactory.call(
        'user:delete',
        { _id: newTerritoryUser._id, territory: newTerritoryUser.territory },
        {
          group: 'territory',
          role: 'admin',
          permissions: ['territory.users.delete'],
          territory: newTerritoryUser.territory,
          _id: newTerritoryUser._id,
        },
      );

      superRequest
        .post('/')
        .send(payload)
        .set('Accept', 'application/json')
        .expect((response) => {
          expect(response.status).to.eq(403);
          expect(response.body).to.have.property('error');
        });
    });

    it('registry operator - should delete user from opertor', async () => {
      const payload = mockFactory.call(
        'user:delete',
        { _id: newOperatorUser._id, territory: newOperatorUser.territory },
        {
          group: 'operator',
          role: 'admin',
          permissions: ['operator.users.delete'],
          operator: newOperatorUser.operator,
          _id: newOperatorUser._id,
        },
      );

      superRequest
        .post('/')
        .send(payload)
        .set('Accept', 'application/json')
        .expect((response) => {
          expect(response.status).to.eq(403);
          expect(response.body).to.have.property('error');
        });
    });
  });

  describe('Find', () => {
    before(async () => {
      newTerritoryUser = await mockServer.addUser(mockFactory.newTerritoryUserModel);
      newOperatorUser = await mockServer.addUser(mockFactory.newOperatorUserModel);
      newRegistryAdmin = await mockServer.addUser(mockFactory.newRegistryAdminModel);
      newRegistryUser = await mockServer.addUser(mockFactory.newRegistryUserModel);
    });

    after(async () => {
      mockServer.clearCollection();
    });

    it('registry admin - should find registry user', async () => {
      const { status, data } = await request.post(
        '/',
        mockFactory.call(
          'user:find',
          { _id: newRegistryUser._id },
          {
            group: 'registry',
            role: 'admin',
            permissions: ['user.read'],
          },
        ),
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
          { _id: newRegistryUser._id },
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

    it("registry user - should not be able to find others' profile", async () => {
      const payload = mockFactory.call(
        'user:find',
        { _id: newTerritoryUser._id },
        {
          group: 'registry',
          role: 'user',
          permissions: ['profile.read'],
          _id: newRegistryUser._id,
        },
      );

      superRequest
        .post('/')
        .send(payload)
        .set('Accept', 'application/json')
        .expect((response) => {
          expect(response.status).to.eq(403);
          expect(response.body).to.have.property('error');
        });
    });

    it('registry admin - should find territory user', async () => {
      const { status: status, data: data } = await request.post(
        '/',
        mockFactory.call(
          'user:find',
          { _id: newTerritoryUser._id },
          {
            group: 'registry',
            role: 'admin',
            permissions: ['user.read'],
          },
        ),
      );

      expect(data.result).to.eql({
        _id: newTerritoryUser._id,
        ...mockFactory.newTerritoryUserModel,
      });
      expect(status).equal(200);
    });

    it('registry admin - should find operator user', async () => {
      const { status: status, data: data } = await request.post(
        '/',
        mockFactory.call(
          'user:find',
          { _id: newOperatorUser._id },
          {
            group: 'registry',
            role: 'admin',
            permissions: ['user.read'],
          },
        ),
      );
      expect(data.result).to.eql({
        _id: newOperatorUser._id,
        ...mockFactory.newOperatorUserModel,
      });
      expect(status).equal(200);
    });

    it('territory admin - should find territory user', async () => {
      const { status: status, data: data } = await request.post(
        '/',
        mockFactory.call(
          'user:find',
          { _id: newTerritoryUser._id },
          {
            group: 'territory',
            role: 'admin',
            permissions: ['territory.users.read'],
            territory: newTerritoryUser.territory,
          },
        ),
      );
      expect(data.result).to.eql({
        _id: newTerritoryUser._id,
        ...mockFactory.newTerritoryUserModel,
      });
      expect(status).equal(200);
    });

    it('operator admin - should find operator user', async () => {
      const { status: status, data: data } = await request.post(
        '/',
        mockFactory.call(
          'user:find',
          { _id: newOperatorUser._id },
          {
            group: 'registry',
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

  describe('List', () => {
    before(async () => {
      newRegistryUser = await mockServer.addUser(mockFactory.newRegistryUserModel);
      newTerritoryUser = await mockServer.addUser(mockFactory.newTerritoryUserModel);
      newOperatorUser = await mockServer.addUser(mockFactory.newOperatorUserModel);
      newRegistryAdmin = await mockServer.addUser(mockFactory.newRegistryAdminModel);
    });

    after(() => {
      mockServer.clearCollection();
    });

    it('registry admin - should list users', async () => {
      const { status: status, data: data } = await request.post(
        '/',
        mockFactory.call(
          'user:list',
          {},
          {
            group: 'registry',
            role: 'admin',
            permissions: ['user.list'],
          },
        ),
      );
      expect(data.result.data[0]).to.eql({
        _id: newRegistryUser._id,
        ...mockFactory.newRegistryUserModel,
      });
      expect(data.result.data[1]).to.eql({
        _id: newTerritoryUser._id,
        ...mockFactory.newTerritoryUserModel,
      });
      expect(data.result.data[2]).to.eql({
        _id: newOperatorUser._id,
        ...mockFactory.newOperatorUserModel,
      });
      expect(status).equal(200);
    });

    it('territory admin - should list territory users', async () => {
      const { status: status, data: data } = await request.post(
        '/',
        mockFactory.call(
          'user:list',
          {},
          {
            group: 'territory',
            role: 'admin',
            permissions: ['territory.users.list'],
            territory: newTerritoryUser.territory,
          },
        ),
      );

      expect(data.result.data[0]).to.eql({
        _id: newTerritoryUser._id,
        ...mockFactory.newTerritoryUserModel,
      });
      expect(status).equal(200);
    });

    it('operator admin - should list operator users', async () => {
      const { status: status, data: data } = await request.post(
        '/',
        mockFactory.call(
          'user:list',
          {},
          {
            group: 'operators',
            role: 'admin',
            permissions: ['operator.users.list'],
            operator: newOperatorUser.operator,
          },
        ),
      );

      expect(data.result.data[0]).to.eql({
        _id: newOperatorUser._id,
        ...mockFactory.newOperatorUserModel,
      });
      expect(status).equal(200);
    });
  });

  describe('Patch', () => {
    before(async () => {
      newTerritoryUser = await mockServer.addUser(mockFactory.newTerritoryUserModel);
      newOperatorUser = await mockServer.addUser(mockFactory.newOperatorUserModel);
      newRegistryAdmin = await mockServer.addUser(mockFactory.newRegistryAdminModel);
      newRegistryUser = await mockServer.addUser(mockFactory.newRegistryUserModel);
    });

    after(() => {
      mockServer.clearCollection();
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
            _id: newRegistryUser._id,
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
            _id: newRegistryUser._id,
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

    it("registry user - shouldn't patch other's profile", async () => {
      const payload = mockFactory.call(
        'user:patch',
        {
          _id: newTerritoryUser._id,
          patch: {
            firstname: 'johnny3',
            lastname: 'smith3',
          },
        },
        {
          group: 'registry',
          role: 'user',
          permissions: ['profile.update'],
          _id: newRegistryUser._id,
        },
      );

      superRequest
        .post('/')
        .send(payload)
        .set('Accept', 'application/json')
        .expect((response) => {
          expect(response.status).to.eq(403);
          expect(response.body).to.have.property('error');
        });
    });

    it('territory admin - should patch territory user', async () => {
      const mockUpdatedProperties = {
        firstname: 'samuel',
        lastname: 'goldschmidt',
      };

      const { status: status, data: data } = await request.post(
        '/',
        mockFactory.call(
          'user:patch',
          {
            _id: newTerritoryUser._id,
            patch: mockUpdatedProperties,
          },
          {
            group: 'territory',
            role: 'admin',
            permissions: ['territory.users.update'],
            territory: newTerritoryUser.territory,
            _id: newTerritoryUser._id,
          },
        ),
      );
      expect(data.result).to.eql({
        _id: newTerritoryUser._id,
        ...mockFactory.newTerritoryUserModel,
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
            _id: newOperatorUser._id,
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

  describe('Change Password', () => {
    before(async () => {
      newTerritoryUser = await mockServer.addUser(mockFactory.newTerritoryUserModel);
      newOperatorUser = await mockServer.addUser(mockFactory.newOperatorUserModel);
      newRegistryAdmin = await mockServer.addUser(mockFactory.newRegistryAdminModel);
      newRegistryUser = await mockServer.addUser({
        ...mockFactory.newRegistryUserModel,
        password: 'passwordRegistryUser',
      });
    });

    after(() => {
      mockServer.clearCollection();
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

      // nockRequest.on('request', (req, interceptor, body) => {
      //   expect(body).to.deep.equal(`{"Email":"${newRegistryUser.email}"}`);
      // });
      expect(data.result).to.eql({
        _id: newRegistryUser._id,
        ...mockFactory.newRegistryUserModel,
      });
      expect(status).equal(200);
    });

    it("registry admin - shouldn't change password with wrong old password", async () => {
      const payload = mockFactory.call(
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
      );

      superRequest
        .post('/')
        .send(payload)
        .set('Accept', 'application/json')
        .expect((response) => {
          expect(response.status).to.eq(401);
          expect(response.body).to.have.property('error');
        });
    });
  });

  describe('Change Email', () => {
    before(async () => {
      newTerritoryUser = await mockServer.addUser(mockFactory.newTerritoryUserModel);
      newOperatorUser = await mockServer.addUser(mockFactory.newOperatorUserModel);
      newRegistryAdmin = await mockServer.addUser(mockFactory.newRegistryAdminModel);
      newRegistryUser = await mockServer.addUser(mockFactory.newRegistryUserModel);
    });

    after(() => {
      mockServer.clearCollection();
    });

    const newEmail = 'newEmail@example.com';
    it('registry admin - should change email registry user', async () => {
      nockRequest.on('request', (req, interceptor, body) => {
        expect(body).to.include(newEmail);
        expect(body).to.include('confirm-email');
      });
      const { status: status, data: data } = await request.post(
        '/',
        mockFactory.call(
          'user:changeEmail',
          {
            _id: newRegistryUser._id,
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

  describe('Forgotten Password', () => {
    before(async () => {
      newTerritoryUser = await mockServer.addUser(mockFactory.newTerritoryUserModel);
      newOperatorUser = await mockServer.addUser(mockFactory.newOperatorUserModel);
      newRegistryAdmin = await mockServer.addUser(mockFactory.newRegistryAdminModel);
      newRegistryUser = await mockServer.addUser(mockFactory.newRegistryUserModel);
    });

    after(() => {
      mockServer.clearCollection();
    });

    it('anonymous - should send email to reset password', async () => {
      nockRequest.on('request', (req, interceptor, body) => {
        expect(body).to.include(newRegistryUser.email);
        expect(body).to.include('reset-password');
      });
      const { status: status, data: data } = await request.post('/', {
        method: 'user:forgottenPassword',
        id: 1,
        jsonrpc: '2.0',
        params: {
          params: {
            email: newRegistryUser.email,
          },
          _context: {
            channel: {
              service: 'proxy',
              transport: 'http',
            },
            call: {
              user: {},
            },
          },
        },
      });

      expect(status).equal(200);
    });
  });

  describe('Login', () => {
    before(async () => {
      newRegistryAdmin = await mockServer.addUser({
        ...mockFactory.newRegistryAdminModel,
        password: 'password',
        status: 'active',
      });
    });

    after(async () => {
      mockServer.clearCollection();
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
            permissions: [],
          },
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
});

// todo:
// 'permission "territory.users.update" shouldn\'t change role of other territory user - reject with not found ?'
// tests for confirm & reset actions
