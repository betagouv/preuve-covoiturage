import anyTest, { TestInterface } from 'ava';
import { ContextType, ForbiddenException } from '@ilos/common';

import { ScopeToSelfMiddleware } from './ScopeToSelfMiddleware';

const test = anyTest as TestInterface<{
  mockConnectedUser: any;
  mockCreateUserParameters: any;
  contextFactory: Function;
  middlewareConfig: any;
  middleware: ScopeToSelfMiddleware;
}>;

test.before((t) => {
  t.context.contextFactory = (params): ContextType => {
    return {
      call: {
        user: {
          ...t.context.mockConnectedUser,
          ...params,
        },
      },
      channel: {
        service: '',
      },
    };
  };

  t.context.mockConnectedUser = {
    _id: '1ab',
    email: 'john.schmidt@example.com',
    firstname: 'john',
    lastname: 'schmidt',
    phone: '0624857425',
    group: 'registry',
    role: 'admin',
    permissions: ['user.create'],
  };

  t.context.mockCreateUserParameters = {
    email: 'edouard.nelson@example.com',
    firstname: 'edouard',
    lastname: 'nelson',
    phone: '+33622222233',
    role: 'admin',
    territory: 42,
  };

  t.context.middlewareConfig = [
    ['user.create'],
    [
      (params, context): string => {
        if ('territory' in params && params.territory === context.call.user.territory) {
          return 'territory.users.add';
        }
      },
      (params, context): string => {
        if ('operator' in params && params.territory === context.call.user.territory) {
          return 'operator.users.add';
        }
      },
    ],
  ];

  t.context.middleware = new ScopeToSelfMiddleware();
});

test('Middleware Scopetoself: has permission to create user', async (t) => {
  const result = await t.context.middleware.process(
    t.context.mockCreateUserParameters,
    t.context.contextFactory({ permissions: ['user.create'] }),
    () => 'next() called',
    t.context.middlewareConfig,
  );

  t.is(result, 'next() called');
});

test('Middleware Scopetoself: has permission to create territory user', async (t) => {
  const result = await t.context.middleware.process(
    t.context.mockCreateUserParameters,
    t.context.contextFactory({
      permissions: ['territory.users.add'],
      territory: t.context.mockCreateUserParameters.territory,
    }),
    () => 'next() called',
    t.context.middlewareConfig,
  );

  t.is(result, 'next() called');
});

test('Middleware Scopetoself: territory admin - has no permission to create territory user', async (t) => {
  await t.throwsAsync(
    t.context.middleware.process(
      t.context.mockCreateUserParameters,
      t.context.contextFactory({ permissions: [], territory: t.context.mockCreateUserParameters.territory }),
      () => {},
      t.context.middlewareConfig,
    ),
    { instanceOf: ForbiddenException },
  );
});

test('Middleware Scopetoself: registry admin - wrong territory', async (t) => {
  await t.throwsAsync(
    t.context.middleware.process(
      t.context.mockCreateUserParameters,
      t.context.contextFactory({ permissions: ['territory.users.add'], territory: 0 }),
      () => {},
      t.context.middlewareConfig,
    ),
    { instanceOf: ForbiddenException },
  );
});
