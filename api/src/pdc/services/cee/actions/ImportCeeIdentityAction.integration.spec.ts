import { ContextType } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import {
  DbContext,
  handlerMacro,
  HandlerMacroContext,
  makeDbBeforeAfter,
} from "@/pdc/providers/test/index.ts";
import {
  ceeJourneyTypeEnumSchema,
  lastNameTruncSchema,
  phoneTruncSchema,
  timestampSchema,
} from "@/shared/cee/common/ceeSchema.ts";
import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/cee/importApplicationIdentity.contract.ts";
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
import { ServiceProvider } from "../ServiceProvider.ts";

const { before, after, error } = handlerMacro<ParamsInterface, ResultInterface>(
  ServiceProvider,
  handlerConfig,
);
const { before: dbBefore, after: dbAfter } = makeDbBeforeAfter();

interface TestContext extends HandlerMacroContext {
  db: DbContext;
}

const test = anyTest as TestFn<TestContext>;
beforeAll(async (t) => {
  const db = await dbBefore();
  const { kernel } = await before();
  kernel
    .getContainer()
    .rebind(PostgresConnection)
    .toConstantValue(
      new PostgresConnection({
        connectionString: db.db.currentConnectionString,
      }),
    );
  t.context = { db, kernel };
});

afterAll(async (t) => {
  await after(t.context);
  await dbAfter(t.context.db);
});

const defaultContext: ContextType = {
  call: { user: { permissions: ["test.run"], operator_id: 1 } },
  channel: { service: "dummy" },
};

const defaultPayload: any = {
  cee_application_type: "specific",
  identity_key:
    "0000000000000000000000000000000000000000000000000000000000000000",
  journey_type: "short",
  last_name_trunc: "ABC",
  phone_trunc: "+336273488",
  datetime: "2023-01-02T00:00:00.000Z",
};

it(
  "Invalid params empty",
  error,
  [],
  (e: any, t) => {
    assertEquals(e.message, "Invalid params");
    assertEquals(e.rpcError?.data[0], ": must NOT have fewer than 1 items");
  },
  defaultContext,
);

it(
  "Invalid params last_name_trunc",
  error,
  [{ ...defaultPayload, last_name_trunc: "abcd" }],
  (e: any, t) => {
    assertEquals(e.message, "Invalid params");
    assertEquals(
      e.rpcError?.data[0],
      `/0/last_name_trunc: ${lastNameTruncSchema.errorMessage}`,
    );
  },
  defaultContext,
);

it(
  "Invalid params unsupported journey type",
  error,
  [{ ...defaultPayload, journey_type: "bip" }],
  (e: any, t) => {
    assertEquals(e.message, "Invalid params");
    assertEquals(
      e.rpcError?.data[0],
      `/0/journey_type: ${ceeJourneyTypeEnumSchema.errorMessage}`,
    );
  },
  defaultContext,
);

it(
  "Invalid params datetime",
  error,
  [{ ...defaultPayload, datetime: "bip" }],
  (e: any, t) => {
    assertEquals(e.message, "Invalid params");
    assertEquals(
      e.rpcError?.data[0],
      `/0/datetime: ${timestampSchema.errorMessage}`,
    );
  },
  defaultContext,
);

it(
  "Invalid params phone_trunc",
  error,
  [{ ...defaultPayload, phone_trunc: "bip" }],
  (e: any, t) => {
    assertEquals(e.message, "Invalid params");
    assertEquals(
      e.rpcError?.data[0],
      `/0/phone_trunc: ${phoneTruncSchema.errorMessage}`,
    );
  },
  defaultContext,
);

it("Unauthorized", error, [defaultPayload], "Unauthorized Error", {
  ...defaultContext,
  call: { user: {} },
});
