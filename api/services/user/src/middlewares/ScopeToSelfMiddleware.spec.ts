import { ContextType, ForbiddenException } from '@ilos/common';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { ScopeToSelfMiddleware } from './ScopeToSelfMiddleware';
import { UserBaseInterface } from '../interfaces/UserInterfaces';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('Middleware Scopetoself', () => {
  const mockConnectedUser = <UserBaseInterface>{
    _id: '1ab',
    email: 'john.schmidt@example.com',
    firstname: 'john',
    lastname: 'schmidt',
    phone: '0624857425',
    group: 'registry',
    role: 'admin',
    permissions: ['user.create'],
  };

  async function noop() {
    return;
  }

  const mockCreateUserParameters = {
    email: 'edouard.nelson@example.com',
    firstname: 'edouard',
    lastname: 'nelson',
    phone: '0622222233',
    group: 'registry',
    role: 'admin',
    territory: 'territoryid',
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

  it('should have permission to create user', async () => {
    const mockCreateUserContext = contextFactory({ permissions: ['user.create'] });

    const result = await middleware.process(mockCreateUserParameters, mockCreateUserContext, noop, [
      ['user.create'],
      [
        (params, context) => {
          if ('territory' in params && params.territory === context.call.user.territory) {
            return 'territory.users.add';
          }
        },
        (params, context) => {
          if ('operator' in params && params.territory === context.call.user.territory) {
            return 'operator.users.add';
          }
        },
      ],
    ]);

    expect(result).to.equal(undefined);
  });

  it('Has no permission to create user - should throw permission error', async () => {
    const mockCreateUserContext = contextFactory({
      permissions: ['territory.users.add'],
      territory: mockCreateUserParameters.territory,
    });

    const response = await middleware.process(mockCreateUserParameters, mockCreateUserContext, noop, [
      ['user.create'],
      [
        (params, context) => {
          if ('territory' in params && params.territory === context.call.user.territory) {
            return 'territory.users.add';
          }
        },
        (params, context) => {
          if ('operator' in params && params.territory === context.call.user.territory) {
            return 'operator.users.add';
          }
        },
      ],
    ]);

    expect(response).to.equal(undefined);
  });

  it('Territory admin - has no permission to create territory user - should throw permission error', async () => {
    const mockCreateUserContext = contextFactory({ permissions: [], territory: mockCreateUserParameters.territory });

    await expect(
      middleware.process(mockCreateUserParameters, mockCreateUserContext, noop, [
        ['user.create'],
        [
          (params, context) => {
            if ('territory' in params && params.territory === context.call.user.territory) {
              return 'territory.users.add';
            }
          },
          (params, context) => {
            if ('operator' in params && params.territory === context.call.user.territory) {
              return 'operator.users.add';
            }
          },
        ],
      ]),
    ).to.rejectedWith(ForbiddenException);
  });

  it('Territory registry - has wrong territory to create territory user - should throw permission error', async () => {
    const mockCreateUserContext = contextFactory({
      permissions: ['territory.users.add'],
      territory: 'wrongTerritoryId',
    });

    await expect(
      middleware.process(mockCreateUserParameters, mockCreateUserContext, noop, [
        ['user.create'],
        [
          (params, context) => {
            if ('territory' in params && params.territory === context.call.user.territory) {
              return 'territory.users.add';
            }
          },
          (params, context) => {
            if ('operator' in params && params.territory === context.call.user.territory) {
              return 'operator.users.add';
            }
          },
        ],
      ]),
    ).to.rejectedWith(ForbiddenException);
  });
});
