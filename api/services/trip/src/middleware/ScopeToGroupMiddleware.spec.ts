import anyTest, { TestInterface } from 'ava';
import { ContextType, ForbiddenException } from '@ilos/common';

import { ScopeToGroupMiddleware } from './ScopeToGroupMiddleware';

const test = anyTest as TestInterface<{
  mockConnectedUser: any;
  mockTripParameters: any;
  contextFactory: Function;
  middlewareConfig: any;
  middleware: ScopeToGroupMiddleware;
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
    permissions: ['trip.list'],
  };

  t.context.mockTripParameters = {
    territory_id: [1],
  };

  t.context.middlewareConfig = {
    global: 'trip.list',
    territory: 'territory.trip.list',
    operator: 'operator.trip.list',
  };

  t.context.middleware = new ScopeToGroupMiddleware();
});

test('Middleware Scopetogroup: has global permission', async (t) => {
  const result = await t.context.middleware.process(
    t.context.mockTripParameters,
    t.context.contextFactory({ permissions: ['trip.list'] }),
    () => 'next() called',
    t.context.middlewareConfig,
  );

  t.is(result, 'next() called');
});

test('Middleware Scopetogroup: has territory permission', async (t) => {
  const result = await t.context.middleware.process(
    t.context.mockTripParameters,
    t.context.contextFactory({
      permissions: ['territory.trip.list'],
      territory_id: t.context.mockTripParameters.territory_id[0],
      authorizedTerritories: t.context.mockTripParameters.territory_id,
    }),
    () => 'next() called',
    t.context.middlewareConfig,
  );

  t.is(result, 'next() called');
});

test('Middleware Scopetogroup: has territory permission autoscope', async (t) => {
  const result = await t.context.middleware.process(
    {},
    t.context.contextFactory({
      permissions: ['territory.trip.list'],
      territory_id: 2,
      authorizedTerritories: [2],
    }),
    (params) => params.territory_id,
    t.context.middlewareConfig,
  );

  t.is(result.length, 1);
  t.is(result[0], 2);
});

test('Middleware Scopetogroup: has territory permission and search on authorized', async (t) => {
  const result = await t.context.middleware.process(
    t.context.mockTripParameters,
    t.context.contextFactory({
      permissions: ['territory.trip.list'],
      territory_id: 2,
      authorizedTerritories: [1, 2],
    }),
    () => 'next() called',
    t.context.middlewareConfig,
  );

  t.is(result, 'next() called');
});

test('Middleware Scopetogroup: has territory permission and search on unauthorized', async (t) => {
  await t.throwsAsync(
    t.context.middleware.process(
      t.context.mockTripParameters,
      t.context.contextFactory({
        permissions: ['territory.trip.list'],
        territory_id: 2,
        authorizedTerritories: [2],
      }),
      () => 'next() called',
      t.context.middlewareConfig,
    ),
    { instanceOf: ForbiddenException },
  );
});

test('Middleware Scopetogroup: has operator permission', async (t) => {
  const result = await t.context.middleware.process(
    { operator_id: 2 },
    t.context.contextFactory({
      permissions: ['operator.trip.list'],
      operator_id: 2,
    }),
    () => 'next() called',
    t.context.middlewareConfig,
  );

  t.is(result, 'next() called');
});

test('Middleware Scopetogroup: has operator permission autoscope', async (t) => {
  const result = await t.context.middleware.process(
    {},
    t.context.contextFactory({
      permissions: ['operator.trip.list'],
      operator_id: 2,
    }),
    (params) => params.operator_id,
    t.context.middlewareConfig,
  );

  t.is(result.length, 1);
  t.is(result[0], 2);
});

test('Middleware Scopetogroup: has operator permission and search on unauthorized', async (t) => {
  await t.throwsAsync(
    t.context.middleware.process(
      { operator_id: [1] },
      t.context.contextFactory({
        permissions: ['operator.trip.list'],
        operator_id: 2,
      }),
      () => 'next() called',
      t.context.middlewareConfig,
    ),
    { instanceOf: ForbiddenException },
  );
});

test('Middleware Scopetogroup: has no permission', async (t) => {
  await t.throwsAsync(
    t.context.middleware.process(
      {},
      t.context.contextFactory({
        permissions: [],
      }),
      () => 'next() called',
      t.context.middlewareConfig,
    ),
    { instanceOf: ForbiddenException },
  );
});
