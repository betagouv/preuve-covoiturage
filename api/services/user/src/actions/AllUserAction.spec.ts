import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { AllUserAction } from './AllUserAction';

chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;

const mockUsers = [{
  _id: '1ab',
  email: 'john.schmidt@example.com',
  firstname: 'john',
  lastname: 'schmidt',
  phone: '0624857425',
}];

class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async all(): Promise<any> {
    return mockUsers;
  }
}

const action = new AllUserAction(new FakeUserRepository());

describe('Create user action', () => {
  it('should work', async () => {
    const result = await action.handle();
    expect(result).to.be.an('array').to['containSubset'](mockUsers);
  });
});

