import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { PostgresConnection } from '@/ilos/connection-postgres/index.ts';
import { ContextType, ForbiddenException } from '@/ilos/common/index.ts';

import { ScopeToGroupMiddleware } from './ScopeToGroupMiddleware.ts';

const test = anyTest as TestFn<{
  connection: PostgresConnection;
  mockConnectedUser: any;
  mockTripParameters: any;
  contextFactory: Function;
  middlewareConfig: any;
  middleware: ScopeToGroupMiddleware;
}>;

const territory_id = 1;
const geo_selector = {
  aom: ['217500016'],
  com: ['91471', '91477', '91377'],
};

const mockConnectedUser = {
  permissions: ['trip.list'],
};

const mockTripParameters = {
  geo_selector: {
    com: ['91477'],
  },
};

const middlewareConfig = {
  registry: 'trip.list',
  territory: 'territory.trip.list',
  operator: 'operator.trip.list',
};

beforeAll(async (t) => {
  t.context.connection = new PostgresConnection({
    connectionString:
      'APP_POSTGRES_URL' in process.env
        ? process.env.APP_POSTGRES_URL
        : 'postgresql://postgres:postgres@localhost:5432/local',
  });
  await t.context.connection.up();
  t.context.contextFactory = (params): ContextType => {
    return {
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
  };

  t.context.middleware = new ScopeToGroupMiddleware(t.context.connection);
});

test.after.always(async (t) => {
  await t.context.connection.down();
});

it('Middleware Scopetogroup: has global permission', async (t) => {
  const result = await t.context.middleware.process(
    mockTripParameters,
    t.context.contextFactory({ permissions: ['trip.list'] }),
    () => 'next() called',
    middlewareConfig,
  );

  assertEquals(result, 'next() called');
});

it('Middleware Scopetogroup: has territory permission', async (t) => {
  const result = await t.context.middleware.process(
    mockTripParameters,
    t.context.contextFactory({
      permissions: ['territory.trip.list'],
      territory_id: territory_id,
      authorizedZoneCodes: geo_selector,
    }),
    () => 'next() called',
    middlewareConfig,
  );

  assertEquals(result, 'next() called');
});

it('Middleware Scopetogroup: has territory permission autoscope', async (t) => {
  const result = await t.context.middleware.process(
    {},
    t.context.contextFactory({
      permissions: ['territory.trip.list'],
      territory_id: 1,
      authorizedZoneCodes: geo_selector,
    }),
    (params) => params.geo_selector,
    middlewareConfig,
  );
  assertObjectMatch(result, { com: geo_selector.com });
});

it('Middleware Scopetogroup: has territory permission unnest selector', async (t) => {
  const result = await t.context.middleware.process(
    { aom: geo_selector.aom },
    t.context.contextFactory({
      permissions: ['territory.trip.list'],
      territory_id: 1,
      authorizedZoneCodes: geo_selector,
    }),
    (params) => params.geo_selector,
    middlewareConfig,
  );
  assertObjectMatch(result, { com: geo_selector.com });
});

it('Middleware Scopetogroup: has territory permission and search on authorized', async (t) => {
  const result = await t.context.middleware.process(
    mockTripParameters,
    t.context.contextFactory({
      permissions: ['territory.trip.list'],
      territory_id: 1,
      authorizedZoneCodes: geo_selector,
    }),
    () => 'next() called',
    middlewareConfig,
  );

  assertEquals(result, 'next() called');
});

it('Middleware Scopetogroup: has territory permission and search on unauthorized', async (t) => {
  await assertThrows(
    t.context.middleware.process(
      mockTripParameters,
      t.context.contextFactory({
        permissions: ['territory.trip.list'],
        territory_id: 1,
        authorizedZoneCodes: { com: ['91377'] },
      }),
      () => 'next() called',
      middlewareConfig,
    ),
    { instanceOf: ForbiddenException },
  );
});

it('Middleware Scopetogroup: has operator permission', async (t) => {
  const result = await t.context.middleware.process(
    { operator_id: 2 },
    t.context.contextFactory({
      permissions: ['operator.trip.list'],
      operator_id: 2,
    }),
    () => 'next() called',
    middlewareConfig,
  );

  assertEquals(result, 'next() called');
});

it('Middleware Scopetogroup: has operator permission autoscope', async (t) => {
  const result = await t.context.middleware.process(
    {},
    t.context.contextFactory({
      permissions: ['operator.trip.list'],
      operator_id: 2,
    }),
    (params) => params.operator_id,
    middlewareConfig,
  );

  assertEquals(result.length, 1);
  assertEquals(result[0], 2);
});

it('Middleware Scopetogroup: has operator permission and search on unauthorized', async (t) => {
  await assertThrows(
    t.context.middleware.process(
      { operator_id: [1] },
      t.context.contextFactory({
        permissions: ['operator.trip.list'],
        operator_id: 2,
      }),
      () => 'next() called',
      middlewareConfig,
    ),
    { instanceOf: ForbiddenException },
  );
});

it('Middleware Scopetogroup: has no permission', async (t) => {
  await assertThrows(
    t.context.middleware.process(
      {},
      t.context.contextFactory({
        permissions: [],
      }),
      () => 'next() called',
      middlewareConfig,
    ),
    { instanceOf: ForbiddenException },
  );
});
