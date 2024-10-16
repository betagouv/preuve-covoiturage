import { afterAll, beforeAll, describe, it } from "@/dev_deps.ts";
import { ContextType } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import {
  assertErrorHandler,
  assertSuccessHandler,
  DbContext,
  KernelContext,
  makeDbBeforeAfter,
  makeKernelBeforeAfter,
} from "@/pdc/providers/test/index.ts";
import { signature } from "@/shared/cee/registerApplication.contract.ts";
import { handlerConfig } from "@/shared/cee/simulateApplication.contract.ts";
import { ServiceProvider } from "../ServiceProvider.ts";
import { config } from "../config/index.ts";

const { before, after } = makeKernelBeforeAfter(ServiceProvider);
const { before: dbBefore, after: dbAfter } = makeDbBeforeAfter();

const defaultContext: ContextType = {
  call: { user: { permissions: ["test.run"], operator_id: 1 } },
  channel: { service: "dummy" },
};

describe("SimulateCeeAction", () => {
  let kernel: KernelContext;
  let db: DbContext;

  beforeAll(async () => {
    db = await dbBefore();
    config.rules.validJourneyConstraint.start_date = new Date("2022-01-01");
    kernel = await before();
    await kernel.kernel.getContainer().get(PostgresConnection).down();
    kernel
      .kernel
      .getContainer()
      .rebind(PostgresConnection)
      .toConstantValue(db.connection);
    await kernel.kernel.call(
      signature,
      {
        journey_type: "long",
        last_name_trunc: "ABC",
        driving_license: "051227308989",
        datetime: "2022-01-02T00:00:00.000Z",
        application_timestamp: "2022-01-02T00:00:00.000Z",
        phone_trunc: "+336273488",
        identity_key:
          "0000000000000000000000000000000000000000000000000000000000000000",
      },
      defaultContext,
    );
  });

  afterAll(async () => {
    await after(kernel);
    await dbAfter(db);
  });

  const defaultShortPayload: any = {
    journey_type: "short",
    last_name_trunc: "DEF",
    phone_trunc: "+336273488",
    driving_license: "051227308990",
    identity_key:
      "0000000000000000000000000000000000000000000000000000000000000000",
  };

  const defaultLongPayload: any = {
    journey_type: "long",
    last_name_trunc: "ABC",
    phone_trunc: "+336273488",
    driving_license: "051227308989",
    identity_key:
      "0000000000000000000000000000000000000000000000000000000000000000",
  };

  it(
    "Invalid last_name_trunc param",
    async () =>
      assertErrorHandler(
        kernel,
        handlerConfig,
        { ...defaultShortPayload, last_name_trunc: "abcd" },
        null,
        // (e: any, t) => {
        //   assertEquals(e.message, "Invalid params");
        //   assertEquals(
        //     e.rpcError?.data[0],
        //     `/last_name_trunc: ${lastNameTruncSchema.errorMessage}`,
        //   );
        // },
        defaultContext,
      ),
  );

  it(
    "Invalid journey_type param",
    async () =>
      assertErrorHandler(
        kernel,
        handlerConfig,
        { ...defaultShortPayload, journey_type: "bip" },
        null,
        //(e: any, t) => {
        //  assertEquals(e.message, "Invalid params");
        //  assertEquals(
        //    e.rpcError?.data[0],
        //    `/journey_type: ${ceeJourneyTypeEnumSchema.errorMessage}`,
        //  );
        //},
        defaultContext,
      ),
  );

  it(
    "Invalid driving_license param",
    async () =>
      assertErrorHandler(
        kernel,
        handlerConfig,
        { ...defaultShortPayload, driving_license: "bip" },
        null,
        //(e: any, t) => {
        //  assertEquals(e.message, "Invalid params");
        //  assertEquals(
        //    e.rpcError?.data[0],
        //    `/driving_license: ${drivingLicenseSchema.errorMessage}`,
        //  );
        //},
        defaultContext,
      ),
  );

  it(
    "Invalid phone_trunc param",
    async () =>
      assertErrorHandler(
        kernel,
        handlerConfig,
        { ...defaultLongPayload, phone_trunc: "bip" },
        null,
        // (e: any, t) => {
        //   assertEquals(e.message, "Invalid params");
        //   assertEquals(
        //     e.rpcError?.data[0],
        //     `/phone_trunc: ${phoneTruncSchema.errorMessage}`,
        //   );
        // },
        defaultContext,
      ),
  );

  it("Unauthorized", async () =>
    assertErrorHandler(
      kernel,
      handlerConfig,
      defaultShortPayload,
      "Unauthorized Error",
      {
        ...defaultContext,
        call: { user: {} },
      },
    ));

  it("Success", async () =>
    assertSuccessHandler(
      kernel,
      handlerConfig,
      defaultShortPayload,
      undefined,
      defaultContext,
    ));

  it(
    "Conflict",
    async () =>
      assertErrorHandler(
        kernel,
        handlerConfig,
        defaultLongPayload,
        null,
        // (e: any, t) => {
        //   assertEquals(e.message, "Conflict");
        //   assertObjectMatch(e.rpcError.data, {
        //     datetime: "2022-01-02T00:00:00.000Z",
        //   });
        // },
        defaultContext,
      ),
  );
});
