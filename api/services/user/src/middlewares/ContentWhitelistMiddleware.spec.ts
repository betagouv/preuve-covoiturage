import { Types, Exceptions } from '@ilos/core';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { UserBaseInterface } from '../interfaces/UserInterfaces';
import { User } from '../entities/User';
import { ContentWhitelistMiddleware } from './ContentWhitelistMiddleware';
import { mockConnectedUserBase, mockUserBase } from '../../tests/mocks/userBase';

chai.use(chaiAsPromised);
const { expect } = chai;

const mockConnectedUser = <UserBaseInterface>{
  ...mockConnectedUserBase,
};

const mockUser = new User({
  ...mockUserBase,
});

const mockUser2 = new User({
  ...mockUserBase,
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

function error(err: Exceptions.RPCException) {
  return {
    status: 200,
    data: {
      jsonrpc: '2.0',
      id: 1,
      error: {
        code: err.rpcError.code,
        message: err.rpcError.message,
        data: err.rpcError.data,
      },
    },
  };
}

function contextFactory(params) {
  return <Types.ContextType>{
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
const middleware = new ContentWhitelistMiddleware();

describe('MIDDLEWARE WHITELIST', () => {
  it('should filter all except listed simple field', async () => {
    const result = await middleware.process({}, mockFindUserContext, findUser, ['firstname', 'lastname']);
    expect(result).to.deep.equal({
      firstname: mockUser.firstname,
      lastname: mockUser.lastname,
    });
  });

  it('should filter all except listed simple field on a list', async () => {
    const result = await middleware.process({}, mockFindUserContext, listUsers, ['firstname', 'lastname']);
    expect(result).to.deep.members([
      {
        firstname: mockUser.firstname,
        lastname: mockUser.lastname,
      },
      {
        firstname: mockUser2.firstname,
        lastname: mockUser2.lastname,
      },
    ]);
  });

  it('should filter all except listed nested field on a list', async () => {
    const result = await middleware.process({}, mockFindUserContext, listNestedUsers, [
      'data.*.firstname',
      'data.*.lastname',
    ]);
    expect(result.data).to.deep.members([
      {
        firstname: mockUser.firstname,
        lastname: mockUser.lastname,
      },
      {
        firstname: mockUser2.firstname,
        lastname: mockUser2.lastname,
      },
    ]);
  });
});
