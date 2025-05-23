import { afterAll, beforeAll, describe, it } from "@/dev_deps.ts";
import { ContextType } from "@/ilos/common/index.ts";
import { LegacyPostgresConnection } from "@/ilos/connection-postgres/index.ts";
import {
  assertErrorHandler,
  assertSuccessHandler,
  KernelContext,
  LegacyDbContext,
  makeKernelBeforeAfter,
  makeLegacyDbBeforeAfter,
} from "@/pdc/providers/test/index.ts";
import { CeeServiceProvider } from "../CeeServiceProvider.ts";
import { handlerConfig } from "../contracts/importApplication.contract.ts";

describe("ImportCeeAction", () => {
  let db: LegacyDbContext;
  let kernel: KernelContext;

  const defaultContext: ContextType = {
    call: { user: { permissions: ["test.run"], operator_id: 1 } },
    channel: { service: "dummy" },
  };

  type Payload = {
    journey_type: string;
    last_name_trunc: string;
    phone_trunc: string;
    datetime: string;
  };

  const defaultPayload: Payload = {
    journey_type: "short",
    last_name_trunc: "IMP",
    phone_trunc: "+336273488",
    datetime: "2023-01-02T00:00:00.000Z",
  };

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const { before, after } = makeKernelBeforeAfter(CeeServiceProvider);
  const { before: dbBefore, after: dbAfter } = makeLegacyDbBeforeAfter();

  beforeAll(async () => {
    db = await dbBefore();
    kernel = await before();
    await kernel.kernel.getContainer().get(LegacyPostgresConnection).down();
    kernel.kernel
      .getContainer()
      .rebind(LegacyPostgresConnection)
      .toConstantValue(db.connection);
  });

  afterAll(async () => {
    await after(kernel);
    await dbAfter(db);
  });

  // ---------------------------------------------------------------------------
  // Tests
  // ---------------------------------------------------------------------------

  it("Invalid params empty", async () => {
    await assertErrorHandler(
      kernel,
      handlerConfig,
      [],
      [],
      defaultContext,
    );
  });

  it("Invalid params last_name_trunc", async () => {
    await assertErrorHandler(
      kernel,
      handlerConfig,
      [{ ...defaultPayload, last_name_trunc: "abcd" }],
      [],
      defaultContext,
    );
  });

  it("Invalid params unsupported journey type", async () => {
    await assertErrorHandler(
      kernel,
      handlerConfig,
      [{ ...defaultPayload, journey_type: "bip" }],
      [],
      defaultContext,
    );
  });

  it("Invalid params datetime", async () => {
    await assertErrorHandler(
      kernel,
      handlerConfig,
      [{ ...defaultPayload, datetime: "bip" }],
      [],
      defaultContext,
    );
  });

  it("Invalid params phone_trunc", async () => {
    await assertErrorHandler(
      kernel,
      handlerConfig,
      [{ ...defaultPayload, phone_trunc: "bip" }],
      [],
      defaultContext,
    );
  });

  it("Unauthorized", async () => {
    await assertErrorHandler(
      kernel,
      handlerConfig,
      [defaultPayload],
      [],
      {
        ...defaultContext,
        call: { user: {} },
      },
    );
  });

  it("Import and record conflicts as failed", async () => {
    await assertSuccessHandler(
      kernel,
      handlerConfig,
      [defaultPayload, defaultPayload],
      {
        imported: 1,
        failed: 1,
        failed_details: [{
          ...defaultPayload,
          error: "Conflict",
        }],
      },
      defaultContext,
    );
  });
});
