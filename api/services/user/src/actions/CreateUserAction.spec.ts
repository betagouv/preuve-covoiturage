import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';


import { CreateUserAction } from './CreateUserAction';
import { User } from '../entities/User';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const mockConnectedUser = <User>{
  _id: '1ab',
  email: 'john.schmidt@example.com',
  firstname: 'john',
  lastname: 'schmidt',
  phone: '0624857425',
  group: 'registry',
  role: 'admin',
  aom: '1ac',
  permissions: [
    'user.list',
  ],
};


const mockNewUser = {
  email: 'edouard.nelson@example.com',
  firstname: 'edouard',
  lastname: 'nelson',
  phone: '0622222233',
  group: 'registry',
  role: 'admin',
  aom: 'aomid',
  password: 'password',
};


const mockId = '1ab';


class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  public async findByEmail(email: string): Promise<User> {
    return null;
  }
  public async update(user:User): Promise<User> {
    return user;
  }
  public async create(user:User): Promise<User> {
    return { ...user, _id: mockId };
  }
}

class FakeCryptoProvider extends CryptoProviderInterfaceResolver{

}


const action = new CreateUserAction(new FakeUserRepository(), new FakeCryptoProvider());

describe('Create user action', () => {
  it('should work', async () => {
    const result = await action.handle(mockNewUser, { call: { user: mockConnectedUser } });

    expect(result).to.include({
      _id: '1ab',
      email: mockNewUser.email,
      firstname: mockNewUser.firstname,
      lastname: mockNewUser.lastname,
      phone: mockNewUser.phone,
      group: mockNewUser.group,
      role: mockNewUser.role,
      aom: mockNewUser.aom,
    });
  });
});

