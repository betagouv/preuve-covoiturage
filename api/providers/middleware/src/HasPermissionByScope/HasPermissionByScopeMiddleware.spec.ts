import anyTest, { TestInterface } from 'ava';
import { ContextType, ForbiddenException } from '@ilos/common';

import { HasPermissionByScopeMiddleware } from './HasPermissionByScopeMiddleware';

const test = anyTest as TestInterface<{
  mockConnectedUser: any;
  mockCreateUserParameters: any;
  contextFactory: Function;
  middlewareConfig: any;
  middleware: HasPermissionByScopeMiddleware;
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
    'user.create',
    [
      ['territory.users.add', 'call.user.territory', 'territory'],
      ['operator.users.add', 'call.user.operator', 'operator'],
    ],
  ];

  t.context.middleware = new HasPermissionByScopeMiddleware();
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
