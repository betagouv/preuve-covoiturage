import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';

import { ContextType, ForbiddenException } from '@ilos/common';

import { ScopeToSelfMiddleware } from './ScopeToSelfMiddleware';

chai.use(chaiAsPromised);
const { expect } = chai;

const mockConnectedUser = {
  _id: '1ab',
  email: 'john.schmidt@example.com',
  firstname: 'john',
  lastname: 'schmidt',
  phone: '0624857425',
  group: 'registry',
  role: 'admin',
  permissions: ['user.create'],
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

const middleware = new ScopeToSelfMiddleware();

describe('Middleware Scopetoself', () => {
  const mockCreateUserContext = contextFactory({ permissions: ['user.create'] });

  it('should have permission to create user', async () => {
    const result = await middleware.process(mockCreateUserParameters, mockCreateUserContext, noop, [
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

describe('Middleware Scopetoself', () => {
  const mockCreateUserContext = contextFactory({ permissions: ['aom.users.add'], aom: mockCreateUserParameters.aom });

  it('Has no permission to create user - should throw permission error', async () => {
    const response = await middleware.process(mockCreateUserParameters, mockCreateUserContext, noop, [
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

describe('Middleware Scopetoself', () => {
  const mockCreateUserContext = contextFactory({ permissions: [], aom: mockCreateUserParameters.aom });

  it('Aom admin - has no permission to create aom user - should throw permission error', async () => {
    await expect(
      middleware.process(mockCreateUserParameters, mockCreateUserContext, noop, [
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
      ]),
    ).to.rejectedWith(ForbiddenException);
  });
});

describe('Middleware Scopetoself', () => {
  const mockCreateUserContext = contextFactory({ permissions: ['aom.users.add'], aom: 'wrongAomId' });

  it('Aom registry - has wrong aom to create aom user - should throw permission error', async () => {
    await expect(
      middleware.process(mockCreateUserParameters, mockCreateUserContext, noop, [
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
      ]),
    ).to.rejectedWith(ForbiddenException);
  });
});
