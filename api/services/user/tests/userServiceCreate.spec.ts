import chai from 'chai';
import chaiNock from 'chai-nock';
import { FakeMongoServer } from './mongo/server';
import { MockFactory } from './mocks/factory';

const fakeMongoServer = new FakeMongoServer();
const mockFactory = new MockFactory();
chai.use(chaiNock);

const { expect } = chai;

let request;

describe('User service', () => {
  before(async () => {
    request = await fakeMongoServer.start();
  });

  after(async () => {
    request = await fakeMongoServer.stop();
  });


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
