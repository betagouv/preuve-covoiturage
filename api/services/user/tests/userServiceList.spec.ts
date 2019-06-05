// tslint:disable max-classes-per-file
import chai from 'chai';
import chaiNock from 'chai-nock';
import { FakeMongoServer } from './mongo/server';
import { MockFactory } from './mocks/factory';


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

let request;

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


  it('registry admin - should list users', async () => {
    const { status: status, data: data } = await request.post(
      '/',
      mockFactory.call(
        'user:list',
        {},
        'registry',
        'admin',
        { permissions:['user.list'] },
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
        { permissions:['aom.users.list'], aom: newAomUser.aom },
      ));
    console.log(data);
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
        { permissions:['operator.users.list'], operator: newOperatorUser.operator },
      ));
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
