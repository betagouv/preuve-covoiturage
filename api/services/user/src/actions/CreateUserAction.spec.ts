import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { RandomProvider, CryptoProvider, CryptoProviderInterfaceResolver, RandomProviderInterfaceResolver } from '@pdc/provider-crypto';


import { CreateUserAction } from './CreateUserAction';
import { User } from '../entities/User';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserInterface } from '../interfaces/UserInterface';

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const mockConnectedUser = <UserInterface>{
  _id: '1ab',
  email: 'john.schmidt@example.com',
  firstname: 'john',
  lastname: 'schmidt',
  phone: '0624857425',
  group: 'registry',
  role: 'admin',
  aom: '1ac',
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
  public async update(user:UserInterface): Promise<User> {
    return user;
  }
  public async create(user:UserInterface): Promise<UserInterface> {
    return { ...user, _id: mockId };
  }
}

// todo: shoud we fake random and crypto providers ?


const action = new CreateUserAction(new FakeUserRepository(), new RandomProvider(), new CryptoProvider());

describe('Create user action', () => {
  it('should work', async () => {
    const result = await action.handle(mockNewUser, { call: { user: mockConnectedUser } });
    console.log(result);
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

