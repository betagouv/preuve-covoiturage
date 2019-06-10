import { Types, Exceptions, Interfaces, Container } from '@pdc/core';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { ScopeToSelfMiddleware } from './ScopeToSelfMiddleware';
import { UserBaseInterface } from '../interfaces/UserInterfaces';


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
  permissions: [
    'user.create',
  ],
};

async function noop(params, context) {
  return;
}

const mockCreateUserParameters = {
  email: 'edouard.nelson@example.com',
  firstname: 'edouard',
  lastname: 'nelson',
  phone: '0622222233',
  group: 'registry',
  role: 'admin',
  aom: 'aomid',
  password: 'password',
};


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
      user:{
        ...mockConnectedUser,
        ...params,
      },
    },
    channel: {
      service: '',
    },
  };
}

const middleware = new ScopeToSelfMiddleware();

describe('Has permission to create user', () => {
  const mockCreateUserContext = contextFactory({ permissions: ['user.create'] });

  it('should work', async () => {
    const result = await middleware.process(
      mockCreateUserParameters,
      mockCreateUserContext,
      noop,
      [
        ['user.create'],
        [
          (params, context) => {
            if ('aom' in params && params.aom === context.call.user.aom) {
              return 'aom.users.add';
            }
          },
          (params, context) => {
            if ('operator' in params && params.aom === context.call.user.aom) {
              return 'operator.users.add';
            }
          },
        ],
      ]);

    expect(result).to.equal(undefined);
  });
});

describe('Has no permission to create user', () => {
  const mockCreateUserContext = contextFactory({ permissions: ['aom.users.add'], aom: mockCreateUserParameters.aom });

  it('should throw permission error', async () => {
    const response = await middleware.process(
      mockCreateUserParameters,
      mockCreateUserContext,
      noop,
      [
        ['user.create'],
        [
          (params, context) => {
            if ('aom' in params && params.aom === context.call.user.aom) {
              return 'aom.users.add';
            }
          },
          (params, context) => {
            if ('operator' in params && params.aom === context.call.user.aom) {
              return 'operator.users.add';
            }
          },
        ],
      ]);

    expect(response).to.equal(undefined);
  });
});

describe('Aom admin - has no permission to create aom user', () => {
  const mockCreateUserContext = contextFactory({ permissions: [], aom: mockCreateUserParameters.aom });

  it('should work', async () => {
    await expect(middleware.process(
      mockCreateUserParameters,
      mockCreateUserContext,
      noop,
      [
        ['user.create'],
        [
          (params, context) => {
            if ('aom' in params && params.aom === context.call.user.aom) {
              return 'aom.users.add';
            }
          },
          (params, context) => {
            if ('operator' in params && params.aom === context.call.user.aom) {
              return 'operator.users.add';
            }
          },
        ],
      ])).to.rejectedWith(Exceptions.ForbiddenException);
  });
});

describe('Aom registry - has wrong aom to create aom user', () => {
  const mockCreateUserContext = contextFactory({ permissions: ['aom.users.add'], aom: 'wrongAomId' });

  it('should throw permission error', async () => {
    await expect(middleware.process(
      mockCreateUserParameters,
      mockCreateUserContext,
      noop,
      [
        ['user.create'],
        [
          (params, context) => {
            if ('aom' in params && params.aom === context.call.user.aom) {
              return 'aom.users.add';
            }
          },
          (params, context) => {
            if ('operator' in params && params.aom === context.call.user.aom) {
              return 'operator.users.add';
            }
          },
        ],
      ])).to.rejectedWith(Exceptions.ForbiddenException);
  });
});
