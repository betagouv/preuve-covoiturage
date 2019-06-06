import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';
import { Providers } from '@pdc/core';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { ListUserAction } from './ListUserAction';
import { User } from '../entities/User';

chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;


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


const mockUsers = [{
  _id: '1ab',
  email: 'john.schmidt@example.com',
  firstname: 'john',
  lastname: 'schmidt',
  phone: '0624857425',
}];

const mockRequest = {
  aom: '1ac',
};

const mockInputPagination = {
  per_page: 25,
  current_page: 1,
  limit: 5,
  skip: 1,
};

const mockOutputPagination = {
  total: 1,
  count: 1,
  per_page: 25,
  current_page: 1,
  total_pages: 1,
};


const mockContext = {
  call: {
    user: mockConnectedUser,
    metadata: {
      pagination: mockInputPagination,
    },
  },
};

class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
  async list(filters, pagination): Promise<any> {
    return { users: mockUsers, total: mockOutputPagination.total, count: mockOutputPagination.count };
  }
}

// todo: missing fake config provider
//
// const action = new ListUserAction(new FakeUserRepository());
//
// describe('list users action', () => {
//   it('should work', async () => {
//     const result = await action.handle(mockRequest, mockContext);
//     expect(result.data).to.be.an('array').to['containSubset'](mockUsers);
//   });
// });

