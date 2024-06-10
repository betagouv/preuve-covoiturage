import {
  afterAll,
  afterEach,
  assert,
  assertEquals,
  assertFalse,
  assertObjectMatch,
  assertThrows,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "@/dev_deps.ts";
import {
  DbContext,
  handlerMacro,
  HandlerMacroContext,
  makeDbBeforeAfter,
} from "@/pdc/providers/test/index.ts";
import { ServiceProvider } from "../ServiceProvider.ts";
import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/cee/simulateApplication.contract.ts";
import { signature } from "@/shared/cee/registerApplication.contract.ts";
import { config } from "../config/index.ts";
import { ContextType } from "@/ilos/common/index.ts";
import {
  ceeJourneyTypeEnumSchema,
  drivingLicenseSchema,
  lastNameTruncSchema,
  phoneTruncSchema,
} from "@/shared/cee/common/ceeSchema.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";

const { before, after, success, error } = handlerMacro<
  ParamsInterface,
  ResultInterface
>(
  ServiceProvider,
  handlerConfig,
);
const { before: dbBefore, after: dbAfter } = makeDbBeforeAfter();

interface TestContext extends HandlerMacroContext {
  db: DbContext;
}

const defaultContext: ContextType = {
  call: { user: { permissions: ["test.run"], operator_id: 1 } },
  channel: { service: "dummy" },
};

const test = anyTest as TestFn<TestContext>;
beforeAll(async (t) => {
  const db = await dbBefore();
  config.rules.validJourneyConstraint.start_date = new Date("2022-01-01");
  const { kernel } = await before();
  kernel
    .getContainer()
    .rebind(PostgresConnection)
    .toConstantValue(
      new PostgresConnection({
        connectionString: db.db.currentConnectionString,
      }),
    );
  await kernel.call(
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
  t.context = { db, kernel };
});

afterAll(async (t) => {
  await after(t.context);
  await dbAfter(t.context.db);
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
  error,
  { ...defaultShortPayload, last_name_trunc: "abcd" },
  (e: any, t) => {
    assertEquals(e.message, "Invalid params");
    assertEquals(
      e.rpcError?.data[0],
      `/last_name_trunc: ${lastNameTruncSchema.errorMessage}`,
    );
  },
  defaultContext,
);

it(
  "Invalid journey_type param",
  error,
  { ...defaultShortPayload, journey_type: "bip" },
  (e: any, t) => {
    assertEquals(e.message, "Invalid params");
    assertEquals(
      e.rpcError?.data[0],
      `/journey_type: ${ceeJourneyTypeEnumSchema.errorMessage}`,
    );
  },
  defaultContext,
);

it(
  "Invalid driving_license param",
  error,
  { ...defaultShortPayload, driving_license: "bip" },
  (e: any, t) => {
    assertEquals(e.message, "Invalid params");
    assertEquals(
      e.rpcError?.data[0],
      `/driving_license: ${drivingLicenseSchema.errorMessage}`,
    );
  },
  defaultContext,
);

it(
  "Invalid phone_trunc param",
  error,
  { ...defaultLongPayload, phone_trunc: "bip" },
  (e: any, t) => {
    assertEquals(e.message, "Invalid params");
    assertEquals(
      e.rpcError?.data[0],
      `/phone_trunc: ${phoneTruncSchema.errorMessage}`,
    );
  },
  defaultContext,
);

it("Unauthorized", error, defaultShortPayload, "Unauthorized Error", {
  ...defaultContext,
  call: { user: {} },
});

it("Success", success, defaultShortPayload, undefined, defaultContext);

it(
  "Conflict",
  error,
  defaultLongPayload,
  (e: any, t) => {
    assertEquals(e.message, "Conflict");
    assertObjectMatch(e.rpcError.data, {
      datetime: "2022-01-02T00:00:00.000Z",
    });
  },
  defaultContext,
);
