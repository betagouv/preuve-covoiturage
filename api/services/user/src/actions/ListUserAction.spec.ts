import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { ListUserAction } from './ListUserAction';
import { UserInterface } from '../interfaces/UserInterface';

chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;


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


const mockUsers = <UserInterface[]>[{
  _id: '1ab',
  email: 'john.schmidt@example.com',
  firstname: 'john',
  lastname: 'schmidt',
  phone: '0624857425',
}];

const mockRequest = {
  aom: '1ac',
};

const mockPagination = {
  total: 1,
  count: 1,
  per_page: 25,
  current_page: 1,
  total_pages: 1,
};


const mockContext = {
  call: {
    user: mockConnectedUser,
    pagination: mockPagination,
  },
};

class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async list(filters, pagination): Promise<any> {
    return mockUsers;
  }
}

const action = new ListUserAction(new FakeUserRepository());

describe('list users action', () => {
  it('should work', async () => {
    const result = await action.handle(mockRequest, mockContext);
    expect(result).to.be.an('array').to['containSubset'](mockUsers);
  });
});

