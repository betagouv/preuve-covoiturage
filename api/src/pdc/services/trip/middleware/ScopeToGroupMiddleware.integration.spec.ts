import { process } from "@/deps.ts";
import {
  afterAll,
  assertEquals,
  assertObjectMatch,
  assertRejects,
  beforeAll,
  describe,
  it,
} from "@/dev_deps.ts";
import { ContextType, ForbiddenException } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { ScopeToGroupMiddleware } from "./ScopeToGroupMiddleware.ts";

describe("Middleware Scopetogroup", () => {
  let connection: PostgresConnection;
  let contextFactory: (params: any) => ContextType;
  let middleware: ScopeToGroupMiddleware;

  const territory_id = 1;
  const geo_selector = {
    aom: ["217500016"],
    com: ["91471", "91477", "91377"],
  };

  const mockConnectedUser = {
    permissions: ["trip.list"],
  };

  const mockTripParameters = {
    geo_selector: {
      com: ["91477"],
    },
  };

  const middlewareConfig = {
    registry: "trip.list",
    territory: "territory.trip.list",
    operator: "operator.trip.list",
  };

  beforeAll(async () => {
    connection = new PostgresConnection({
      connectionString: "APP_POSTGRES_URL" in process.env
        ? process.env.APP_POSTGRES_URL
        : "postgresql://postgres:postgres@localhost:5432/local",
    });
    await connection.up();
    contextFactory = (params): ContextType => {
      return {
        call: {
          user: {
            ...mockConnectedUser,
            ...params,
          },
        },
        channel: {
          service: "",
        },
      };
    };

    middleware = new ScopeToGroupMiddleware(connection);
  });

  afterAll(async () => {
    await connection.down();
  });

  it("has global permission", async () => {
    const result = await middleware.process(
      mockTripParameters,
      contextFactory({ permissions: ["trip.list"] }),
      () => new Promise((resolve) => resolve("next() called")),
      middlewareConfig,
    );

    assertEquals(result, "next() called");
  });

  it("has territory permission", async () => {
    const result = await middleware.process(
      mockTripParameters,
      contextFactory({
        permissions: ["territory.trip.list"],
        territory_id: territory_id,
        authorizedZoneCodes: geo_selector,
      }),
      () => new Promise((resolve) => resolve("next() called")),
      middlewareConfig,
    );

    assertEquals(result, "next() called");
  });

  it("has territory permission autoscope", async () => {
    const result = await middleware.process(
      {},
      contextFactory({
        permissions: ["territory.trip.list"],
        territory_id: 1,
        authorizedZoneCodes: geo_selector,
      }),
      (params) => params.geo_selector,
      middlewareConfig,
    );
    assertObjectMatch(result, { com: geo_selector.com });
  });

  it("has territory permission unnest selector", async () => {
    const result = await middleware.process(
      { aom: geo_selector.aom },
      contextFactory({
        permissions: ["territory.trip.list"],
        territory_id: 1,
        authorizedZoneCodes: geo_selector,
      }),
      (params) => params.geo_selector,
      middlewareConfig,
    );
    assertObjectMatch(result, { com: geo_selector.com });
  });

  it("has territory permission and search on authorized", async () => {
    const result = await middleware.process(
      mockTripParameters,
      contextFactory({
        permissions: ["territory.trip.list"],
        territory_id: 1,
        authorizedZoneCodes: geo_selector,
      }),
      () => new Promise((resolve) => resolve("next() called")),
      middlewareConfig,
    );

    assertEquals(result, "next() called");
  });

  it("has territory permission and search on unauthorized", async () => {
    await assertRejects(
      async () =>
        await middleware.process(
          mockTripParameters,
          contextFactory({
            permissions: ["territory.trip.list"],
            territory_id: 1,
            authorizedZoneCodes: { com: ["91377"] },
          }),
          () => new Promise((resolve) => resolve("next() called")),
          middlewareConfig,
        ),
      ForbiddenException,
    );
  });

  it("has operator permission", async () => {
    const result = await middleware.process(
      { operator_id: 2 },
      contextFactory({
        permissions: ["operator.trip.list"],
        operator_id: 2,
      }),
      () => new Promise((resolve) => resolve("next() called")),
      middlewareConfig,
    );

    assertEquals(result, "next() called");
  });

  it("has operator permission autoscope", async () => {
    const result = await middleware.process(
      {},
      contextFactory({
        permissions: ["operator.trip.list"],
        operator_id: 2,
      }),
      (params) => params.operator_id,
      middlewareConfig,
    );

    assertEquals(result.length, 1);
    assertEquals(result[0], 2);
  });

  it("has operator permission and search on unauthorized", async () => {
    await assertRejects(
      async () =>
        await middleware.process(
          { operator_id: [1] },
          contextFactory({
            permissions: ["operator.trip.list"],
            operator_id: 2,
          }),
          () => new Promise((resolve) => resolve("next() called")),
          middlewareConfig,
        ),
      ForbiddenException,
    );
  });

  it("has no permission", async () => {
    await assertRejects(
      async () =>
        await middleware.process(
          {},
          contextFactory({ permissions: [] }),
          () => new Promise((resolve) => resolve("next() called")),
          middlewareConfig,
        ),
      ForbiddenException,
    );
  });
});
