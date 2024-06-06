import anyTest, { TestFn } from 'ava';
import { ContextType, ForbiddenException } from '@/ilos/common/index.ts';

import { HasPermissionByScopeMiddleware } from './HasPermissionByScopeMiddleware.ts';

const test = anyTest as TestFn<{
  mockSuperAdmin: any;
  mockTerritoryAdmin: any;
  mockCreateUserParameters: any;
  mockAllStatsParams: any;
  mockTownStatsParams: any;
  contextFactory: Function;
  middlewareConfigUserCreate: any;
  middlewareConfigTripStats: any;
  middleware: HasPermissionByScopeMiddleware;
}>;

test.before((t) => {
  t.context.contextFactory = (params): ContextType => {
    return {
      call: {
        user: {
          ...t.context.mockSuperAdmin,
          ...params,
        },
      },
      channel: {
        service: '',
      },
    };
  };

  t.context.mockSuperAdmin = {
    _id: '1ab',
    email: 'john.schmidt@example.com',
    firstname: 'john',
    lastname: 'schmidt',
    phone: '0624857425',
    group: 'registry',
    role: 'admin',
    permissions: ['registry.user.create'],
  };

  t.context.mockTerritoryAdmin = {
    _id: 2,
    email: 'territory.admin@example.com',
    firstname: 'john',
    lastname: 'schmidt',
    phone: '0624857425',
    group: 'territories',
    role: 'admin',
    territory_id: 42,
    permissions: ['territory.trip.stats'],
    authorizedZoneCodes: { _id: [42, 43, 44, 45] },
  };

  t.context.mockCreateUserParameters = {
    email: 'edouard.nelson@example.com',
    firstname: 'edouard',
    lastname: 'nelson',
    phone: '+33622222233',
    role: 'admin',
    territory_id: 42,
  };

  t.context.middlewareConfigUserCreate = [
    'registry.user.create',
    [
      ['territory.users.add', 'call.user.territory_id', 'territory_id'],
      ['operator.users.add', 'call.user.operator_id', 'operator_id'],
    ],
  ];

  t.context.middlewareConfigTripStats = [
    'registry.trip.stats',
    [
      ['territory.trip.stats', 'call.user.authorizedZoneCodes._id', 'territory_id'],
      ['operator.trip.stats', 'call.user.operator_id', 'operator_id'],
    ],
  ];

  t.context.mockAllStatsParams = {
    date: { start: new Date('2020-01-01T00:00:00+0100') },
    tz: 'Europe/Paris',
  };

  t.context.mockTownStatsParams = {
    date: { start: new Date('2020-01-01T00:00:00+0100') },
    territory_id: [43],
    tz: 'Europe/Paris',
  };

  t.context.middleware = new HasPermissionByScopeMiddleware();
});

test('Middleware Scopetoself: has permission to create user', async (t) => {
  const result = await t.context.middleware.process(
    t.context.mockCreateUserParameters,
    t.context.contextFactory({ permissions: ['registry.user.create'] }),
    () => 'next() called',
    t.context.middlewareConfigUserCreate,
  );

  t.is(result, 'next() called');
});

test('Middleware Scopetoself: has permission to create territory user', async (t) => {
  const result = await t.context.middleware.process(
    t.context.mockCreateUserParameters,
    t.context.contextFactory({
      permissions: ['territory.users.add'],
      territory_id: t.context.mockCreateUserParameters.territory_id,
    }),
    () => 'next() called',
    t.context.middlewareConfigUserCreate,
  );

  t.is(result, 'next() called');
});

test('Middleware Scopetoself: territory admin - has no permission to create territory user', async (t) => {
  await t.throwsAsync(
    t.context.middleware.process(
      t.context.mockCreateUserParameters,
      t.context.contextFactory({ permissions: [], territory: t.context.mockCreateUserParameters.territory }),
      () => {},
      t.context.middlewareConfigUserCreate,
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
      t.context.middlewareConfigUserCreate,
    ),
    { instanceOf: ForbiddenException },
  );
});

test('Middleware Scopetoself: super-admin can trip.stats', async (t) => {
  const result = await t.context.middleware.process(
    t.context.mockAllStatsParams,
    t.context.contextFactory({ permissions: ['registry.trip.stats'] }),
    () => 'next() called',
    t.context.middlewareConfigTripStats,
  );

  t.is(result, 'next() called');
});

test('Middleware Scopetoself: super-admin can trip.stats with town filter', async (t) => {
  const result = await t.context.middleware.process(
    t.context.mockTownStatsParams,
    t.context.contextFactory({ permissions: ['registry.trip.stats'] }),
    () => 'next() called',
    t.context.middlewareConfigTripStats,
  );

  t.is(result, 'next() called');
});

test('Middleware Scopetoself: territory-admin can trip.stats', async (t) => {
  // mock territory_id being added by copy.from_context middleware
  const params = { ...t.context.mockAllStatsParams, territory_id: t.context.mockTerritoryAdmin.territory_id };

  const context = t.context.contextFactory(t.context.mockTerritoryAdmin);

  const result = await t.context.middleware.process(
    params,
    context,
    () => 'next() called',
    t.context.middlewareConfigTripStats,
  );

  t.is(result, 'next() called');
});

test('Middleware Scopetoself: territory-admin can trip.stats w/ town filter', async (t) => {
  // mock territory_id being added by copy.from_context middleware
  const params = t.context.mockTownStatsParams;
  const context = t.context.contextFactory(t.context.mockTerritoryAdmin);

  const result = await t.context.middleware.process(
    params,
    context,
    () => 'next() called',
    t.context.middlewareConfigTripStats,
  );

  t.is(result, 'next() called');
});
