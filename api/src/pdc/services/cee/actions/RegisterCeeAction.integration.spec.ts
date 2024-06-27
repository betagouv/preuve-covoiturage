import { createSign } from "@/deps.ts";
import {
  afterAll,
  assertEquals,
  assertObjectMatch,
  beforeAll,
  describe,
  it,
} from "@/dev_deps.ts";
import { ContextType } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { CarpoolV1StatusEnum } from "@/pdc/providers/carpool/interfaces/common.ts";
import {
  assertErrorHandler,
  assertHandler,
  DbContext,
  KernelContext,
  makeDbBeforeAfter,
  makeKernelBeforeAfter,
} from "@/pdc/providers/test/index.ts";
import {
  CeeJourneyTypeEnum,
  CeeLongApplicationInterface,
  CeeShortApplicationInterface,
} from "@/shared/cee/common/CeeApplicationInterface.ts";
import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/cee/registerApplication.contract.ts";
import { ServiceProvider } from "../ServiceProvider.ts";
import { config } from "../config/index.ts";

describe("RegisterCeeAction", () => {
  let db: DbContext;
  let kernel: KernelContext;
  config.rules.validJourneyConstraint.start_date = new Date("2022-01-01");

  const defaultContext: ContextType = {
    call: { user: { permissions: ["test.run"], operator_id: 1 } },
    channel: { service: "dummy" },
  };

  const defaultShortPayload: CeeShortApplicationInterface = {
    journey_type: CeeJourneyTypeEnum.Short,
    last_name_trunc: "ABC",
    driving_license: "051227308989",
    application_timestamp: "2022-01-02T00:00:00.000Z",
    operator_journey_id: "operator_journey_id-1",
    identity_key: "0".repeat(64),
  };

  const defaultLongPayload: Omit<CeeLongApplicationInterface, "datetime"> & {
    datetime: string;
  } = {
    journey_type: CeeJourneyTypeEnum.Long,
    last_name_trunc: "ABC",
    driving_license: "051227308989",
    datetime: "2022-01-02T00:00:00.000Z",
    application_timestamp: "2022-01-02T00:00:00.000Z",
    phone_trunc: "+336273488",
    identity_key: "0".repeat(64),
  };

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const { before, after } = makeKernelBeforeAfter(ServiceProvider);
  const { before: dbBefore, after: dbAfter } = makeDbBeforeAfter();

  beforeAll(async () => {
    db = await dbBefore();
    kernel = await before();

    // close the existing Postgres connection as the rebind does
    // not call the destroy hook.
    await kernel.kernel.getContainer().get(PostgresConnection).down();

    // set the test connection to let it access seeded data
    kernel.kernel
      .getContainer()
      .rebind(PostgresConnection)
      .toConstantValue(db.connection);
  });

  afterAll(async () => {
    await after(kernel);
    await dbAfter(db);
  });

  // ---------------------------------------------------------------------------
  // Tests
  // ---------------------------------------------------------------------------

  it("Invalid params last_name_trunc", async () => {
    await assertErrorHandler(
      kernel,
      handlerConfig,
      { ...defaultShortPayload, last_name_trunc: "abcd" },
      [],
      defaultContext,
    );
  });

  it("Invalid params unsupported journey type", async () => {
    await assertErrorHandler(
      kernel,
      handlerConfig,
      { ...defaultShortPayload, journey_type: "bip" },
      [],
      defaultContext,
    );
  });

  it("Invalid params unsupported driving license", async () => {
    await assertErrorHandler(
      kernel,
      handlerConfig,
      { ...defaultShortPayload, driving_license: "bip" },
      [],
      defaultContext,
    );
  });

  it("Invalid params unsupported operator_journey_id", async () => {
    await assertErrorHandler(
      kernel,
      handlerConfig,
      { ...defaultShortPayload, operator_journey_id: 1 },
      [],
      defaultContext,
    );
  });

  it("Invalid params unsupported identity_key", async () => {
    await assertErrorHandler(
      kernel,
      handlerConfig,
      { ...defaultShortPayload, identity_key: "bip" },
      [],
      defaultContext,
    );
  });

  it("Invalid params unsupported phone_trunc", async () => {
    await assertErrorHandler(
      kernel,
      handlerConfig,
      { ...defaultShortPayload, phone_trunc: "bip" },
      [],
      defaultContext,
    );
  });

  it("Unauthorized", async () => {
    await assertErrorHandler(
      kernel,
      handlerConfig,
      defaultShortPayload,
      [],
      { ...defaultContext, call: { user: {} } },
    );
  });

  it("Invalid datetime from now()", async () => {
    await assertErrorHandler(
      kernel,
      handlerConfig,
      { ...defaultLongPayload, datetime: new Date().toISOString() },
      [],
      defaultContext,
    );
  });

  it("Successful registration 1", async () => {
    await assertHandler<ParamsInterface, ResultInterface>(
      kernel,
      defaultContext,
      handlerConfig,
      defaultShortPayload,
      async (response) => {
        const { uuid: _uuid, ...resp } = response;
        await assertEquals(resp, {
          journey_id: 1,
          datetime: "2024-03-15T00:15:00.000Z",
          status: CarpoolV1StatusEnum.Ok,
          token: (function (): string {
            const private_key = config.signature.private_key as string;
            const signer = createSign("RSA-SHA512");
            signer.write(
              [
                "89248032800012",
                "short",
                defaultShortPayload.driving_license,
                "2024-03-15T00:15:00.000Z",
              ].join("/"),
            );
            signer.end();
            return signer.sign(private_key, "base64");
          })(),
        });
      },
    );
  });

  /**
   * @deprecated [carpool_v2_migration]
   */
  it("Successful registration 2", async () => {
    await assertHandler<ParamsInterface, ResultInterface>(
      kernel,
      defaultContext,
      handlerConfig,
      {
        ...defaultShortPayload,
        operator_journey_id: "operator_journey_id-2",
        last_name_trunc: "DEF",
        driving_license: "051227308990",
        identity_key: "1".repeat(64),
      },
      async (response) => {
        const { uuid: _uuid, ...resp } = response;
        await assertEquals(resp, {
          journey_id: 2,
          datetime: "2024-03-16T00:15:00.000Z",
          status: CarpoolV1StatusEnum.Ok,
          token: (function (): string {
            const private_key = config.signature.private_key as string;
            const signer = createSign("RSA-SHA512");
            signer.write(
              [
                "89248032800012",
                "short",
                "051227308990",
                "2024-03-16T00:15:00.000Z",
              ]
                .join("/"),
            );
            signer.end();
            return signer.sign(private_key, "base64");
          })(),
        });
      },
    );
  });

  /**
   * @deprecated [carpool_v2_migration]
   */
  it("Successful registration 3", async () => {
    await assertHandler<ParamsInterface, ResultInterface>(
      kernel,
      defaultContext,
      handlerConfig,
      {
        ...defaultShortPayload,
        operator_journey_id: "operator_journey_id-3",
        last_name_trunc: "GHI",
        driving_license: "051227308991",
        identity_key: "2".repeat(64),
      },
      async (response) => {
        const { uuid: _uuid, ...resp } = response;
        await assertEquals(resp, {
          journey_id: 3,
          datetime: "2024-03-16T00:15:00.000Z",
          status: CarpoolV1StatusEnum.Ok,
          token: (function (): string {
            const private_key = config.signature.private_key as string;
            const signer = createSign("RSA-SHA512");
            signer.write(
              [
                "89248032800012",
                "short",
                "051227308991",
                "2024-03-16T00:15:00.000Z",
              ]
                .join("/"),
            );
            signer.end();
            return signer.sign(private_key, "base64");
          })(),
        });
      },
    );
  });

  /**
   * @deprecated [carpool_v2_migration]
   */
  it("Ensure deprecated carpool_id are properly inserted", async () => {
    const result = await db.connection.getClient().query(`
      SELECT carpool_id, operator_id, operator_journey_id
      FROM cee.cee_applications
      ORDER BY operator_journey_id
    `);
    assertEquals(result.rowCount, 3);
    assertObjectMatch(result.rows[0], {
      carpool_id: 1,
      operator_id: 1,
      operator_journey_id: "operator_journey_id-1",
    });
    assertObjectMatch(result.rows[1], {
      carpool_id: 3,
      operator_id: 1,
      operator_journey_id: "operator_journey_id-2",
    });
    assertObjectMatch(result.rows[2], {
      carpool_id: 5,
      operator_id: 1,
      operator_journey_id: "operator_journey_id-3",
    });
  });

  it("Conflict", async () => {
    await assertErrorHandler(
      kernel,
      handlerConfig,
      { ...defaultShortPayload, operator_journey_id: "operator_journey_id-2" },
      [],
      defaultContext,
    );
  });

  it("Not Found", async () => {
    await assertErrorHandler(
      kernel,
      handlerConfig,
      {
        ...defaultShortPayload,
        operator_journey_id: "operator_journey_id-wrong",
      },
      [],
      defaultContext,
    );
  });

  it("Should have register errors", async () => {
    const result = await db.connection.getClient().query(`
      SELECT * FROM cee.cee_application_errors ORDER BY created_at
    `);
    assertEquals(result.rowCount, 3);
    assertObjectMatch(result.rows[0], { error_type: "date" });
    assertObjectMatch(result.rows[1], { error_type: "conflict" });
    assertObjectMatch(result.rows[2], { error_type: "non-eligible" });
  });
});
