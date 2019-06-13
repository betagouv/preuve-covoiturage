import { Types, Exceptions } from '@ilos/core';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { UserBaseInterface } from '../interfaces/UserInterfaces';
import { User } from '../entities/User';
import { FilterOutputMiddleware } from './FilterOutputMiddleware';

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const mockConnectedUser = <UserBaseInterface>{
  _id: '1ab',
  email: 'john.schmidt@example.com',
  firstname: 'john',
  lastname: 'schmidt',
  phone: '0624857425',
  group: 'registry',
  role: 'admin',
  permissions: [],
};

const mockUser = new User({
  email: 'edouard.nelson@example.com',
  firstname: 'edouard',
  lastname: 'nelson',
  phone: '0622222233',
  group: 'registry',
  role: 'admin',
  aom: 'aomid',
  permissions: [],
});

async function findUser(params, context): Promise<User> {
  return new User({ ...mockUser, password: 'password' });
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

const middleware = new FilterOutputMiddleware();

describe('Filter password from result', () => {
  const mockFindUserContext = contextFactory({ permissions: [] });

  it('should work', async () => {
    const result = await middleware.process({}, mockFindUserContext, findUser, ['password']);
    expect(result).to.not.have.property('password');
  });
});
