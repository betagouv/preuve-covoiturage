/**
 * Test the CreateActionV2 and CreateActionV3 classes with proper payloads
 * Middlewares:
 * - permission
 * - castToArray ?
 * - timezone
 * - copyFromContext(created_by, operator_id, territory_id)
 * - payload Validation
 *
 * Features:
 * - recipients
 * - creator as recipient
 * - store: check response
 * - store: check existence in DB
 */
import { afterAll, assertEquals, beforeAll, describe, it } from "@/dev_deps.ts";
import { ContextType } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import {
  AJVParamsInterface,
  assertHandler,
  DbContext,
  KernelContext,
  makeDbBeforeAfter,
  makeKernelBeforeAfter,
} from "@/pdc/providers/test/index.ts";
import { ServiceProvider as ExportSP } from "@/pdc/services/export/ServiceProvider.ts";
import {
  ExportStatus,
  ExportTarget,
} from "@/pdc/services/export/models/Export.ts";
import { ServiceProvider as UserSP } from "@/pdc/services/user/ServiceProvider.ts";
import {
  handlerConfigV3,
  ParamsInterfaceV3,
  ResultInterfaceV3,
} from "@/shared/export/create.contract.ts";

const { before: kernelBefore, after: kernelAfter } = makeKernelBeforeAfter(
  UserSP,
  ExportSP,
);
const { before: dbBefore, after: dbAfter } = makeDbBeforeAfter();

describe("CreateAction V3", () => {
  let db: DbContext;
  let kc: KernelContext;

  const defaultContext: ContextType = {
    call: { user: { permissions: ["common.export.create"] } },
    channel: { service: "proxy" },
  };

  /**
   * - boot up postgresql connection
   * - create the kernel
   * - stop the existing kernel connection to replace it with the test one
   */
  beforeAll(async () => {
    db = await dbBefore();
    kc = await kernelBefore();
    await kc.kernel.getContainer().get(PostgresConnection).down();
    kc.kernel
      .getContainer()
      .rebind(PostgresConnection)
      .toConstantValue(db.connection);
  });

  afterAll(async () => {
    await kernelAfter(kc);
    await dbAfter(db);
  });

  it("should create an export with a creator as recipient", async () => {
    const start_at = "2024-01-01T00:00:00+0100";
    const end_at = "2024-01-02T00:00:00+0100";

    const params: AJVParamsInterface<
      ParamsInterfaceV3,
      "start_at" | "end_at"
    > = {
      tz: "Europe/Paris",
      start_at,
      end_at,
      created_by: 1,
      operator_id: [1],
    };

    // UUID is omitted as we have no way to predict it
    const expected: Omit<ResultInterfaceV3, "uuid"> = {
      // uuid: "uuid",
      target: ExportTarget.OPENDATA,
      status: ExportStatus.PENDING,
      start_at: new Date(start_at),
      end_at: new Date(end_at),
    };

    await assertHandler(
      kc,
      defaultContext,
      handlerConfigV3,
      params,
      (response: ResultInterfaceV3) => {
        const { uuid: _uuid, ...actual } = response;
        assertEquals(actual, expected);
      },
    );
  });

  it("should create an export with multiple recipients", () => {});
  it("should create a default export (opendata)", () => {});
  it("should create a territory export", () => {});
  it("should create an operator export", () => {});
});

describe("CreateAction V2", () => {});
