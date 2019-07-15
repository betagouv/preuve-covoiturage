import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { ContextType } from '@ilos/common';

import { UserBaseInterface } from '../interfaces/UserInterfaces';
import { User } from '../entities/User';
import { ContentBlacklistMiddleware } from './ContentBlacklistMiddleware';
import { mockConnectedUserBase } from '../../tests/mocks/connectedUserBase';
import { mockNewUserBase } from '../../tests/mocks/newUserBase';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('Middleware Blacklist', () => {
  const mockConnectedUser = <UserBaseInterface>{
    ...mockConnectedUserBase,
  };

  const mockUser = new User({
    ...mockNewUserBase,
  });

  const mockUser2 = new User({
    ...mockNewUserBase,
  });

  const mockListUsers = [
    new User({ ...mockUser, password: 'password1' }),
    new User({ ...mockUser2, password: 'password2' }),
  ];

  async function findUser(params, context): Promise<User> {
    return new User({ ...mockUser, password: 'password' });
  }

  async function listUsers(params, context): Promise<User[]> {
    return mockListUsers;
  }

  async function listNestedUsers(params, context): Promise<{ data: User[] }> {
    return { data: mockListUsers };
  }

  function contextFactory(params) {
    return <ContextType>{
      call: {
        user: {
          ...mockConnectedUser,
          ...params,
        },
      },
      channel: {
        service: '',
      },
    };
  }

  const mockFindUserContext = contextFactory({ permissions: [] });
  const middleware = new ContentBlacklistMiddleware();

  it('should filter all except listed simple field', async () => {
    const result = await middleware.process({}, mockFindUserContext, findUser, ['firstname', 'lastname']);
    expect(result).not.to.have.property('firstname');
    expect(result).not.to.have.property('lastname');
  });

  it('should filter all except listed simple field on a list', async () => {
    const result = await middleware.process({}, mockFindUserContext, listUsers, ['firstname', 'lastname']);

    expect(result).to.be.an('array');

    for (const r of result) {
      expect(r).not.to.have.property('firstname');
      expect(r).not.to.have.property('lastname');
    }
  });

  it('should filter all except listed nested field on a list', async () => {
    const result = await middleware.process({}, mockFindUserContext, listNestedUsers, [
      'data.*.firstname',
      'data.*.lastname',
    ]);
    expect(result.data).to.be.an('array');

    for (const r of result.data) {
      expect(r).not.to.have.property('firstname');
      expect(r).not.to.have.property('lastname');
    }
  });
});
