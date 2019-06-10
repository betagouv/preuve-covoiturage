import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';

import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { PatchUserAction } from './PatchUserAction';
import { UserBaseInterface } from '../interfaces/UserInterfaces';
import { User } from '../entities/User';


chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;


const mockConnectedUser = <UserBaseInterface>{
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


const mockUser = {
  _id: '1ab',
  firstname: 'john',
  lastname: 'schmidt',
  phone: '0624857425',
};

const mockUserNewProperties = {
  firstname: 'johnny',
  lastname: 'smith',
};

class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async patchUser(id: string, patch: any): Promise<User> {
    return new User({
      _id: id,
      ...patch,
    });
  }
}

class FakeCryptoProvider extends CryptoProviderInterfaceResolver {}

const action = new PatchUserAction(new FakeUserRepository(), new FakeCryptoProvider());


describe('Update user action', () => {
  it('should work', async () => {
    const result = await action.handle(
      {  id: mockUser._id , patch: mockUserNewProperties },
      { call: { user: mockConnectedUser } });
    expect(result).to.include({ _id: mockUser._id , ...mockUserNewProperties });
  });
});

