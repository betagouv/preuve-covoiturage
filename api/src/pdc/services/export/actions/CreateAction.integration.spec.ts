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
import { faker } from "@/deps.ts";
import { afterAll, assertEquals, beforeAll, describe, it } from "@/dev_deps.ts";
import { ContextType } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { set } from "@/lib/object/index.ts";
import { User, users } from "@/pdc/providers/seed/users.ts";
import {
  AJVParamsInterface,
  assertHandler,
  DbContext,
  KernelContext,
  makeDbBeforeAfter,
  makeKernelBeforeAfter,
} from "@/pdc/providers/test/index.ts";
import { ExportServiceProvider as ExportSP } from "@/pdc/services/export/ExportServiceProvider.ts";
import { Export, ExportStatus, ExportTarget } from "@/pdc/services/export/models/Export.ts";
import { ExportParams } from "@/pdc/services/export/models/ExportParams.ts";
import { UserServiceProvider as UserSP } from "@/pdc/services/user/UserServiceProvider.ts";
import { handlerConfigV3, ParamsInterfaceV3, ResultInterfaceV3 } from "../contracts/create.contract.ts";

const { before: kernelBefore, after: kernelAfter } = makeKernelBeforeAfter(
  UserSP,
  ExportSP,
);
const { before: dbBefore, after: dbAfter } = makeDbBeforeAfter();

/**
 * Simple Export fetcher to get all records and cast their values
 */
type FullExport = Export & {
  recipients: Array<{ email: string; fullname: string; message: string }>;
};
function fetcher(db: DbContext) {
  return async (): Promise<FullExport[]> => {
    const res = await db.connection.getClient().query(`
      SELECT
        ee.*,
        array_agg(json_build_object(
          'email', er.email,
          'fullname', er.fullname,
          'message', er.message
        )) as recipients
      FROM export.exports ee
      JOIN export.recipients er ON ee._id = er.export_id
      GROUP BY ee._id
      ORDER BY ee._id ASC
    `);

    return res.rowCount ? res.rows.map((r) => ({ ...r, params: ExportParams.fromJSON(r.params) })) : [];
  };
}

describe("CreateAction V3", () => {
  // ---------------------------------------------------------------------------
  // SETUP
  // ---------------------------------------------------------------------------

  let db: DbContext;
  let kc: KernelContext;
  let fetchExports: () => Promise<FullExport[]>;

  const defaultContext: ContextType = {
    call: { user: { permissions: ["common.export.create"] } },
    channel: { service: "proxy" },
  };

  type UserWithId = User & { _id: number };
  const adminUser: UserWithId = { _id: 1, ...users[0] };

  /**
   * - boot up postgresql connection
   * - create the kernel
   * - stop the existing kernel connection to replace it with the test one
   * - setup the db macro with the connection
   */
  beforeAll(async () => {
    db = await dbBefore();
    kc = await kernelBefore();
    await kc.kernel.getContainer().get(PostgresConnection).down();
    kc.kernel
      .getContainer()
      .rebind(PostgresConnection)
      .toConstantValue(db.connection);
    fetchExports = fetcher(db);
  });

  afterAll(async () => {
    await kernelAfter(kc);
    await dbAfter(db);
  });

  // ---------------------------------------------------------------------------
  // TESTS
  // ---------------------------------------------------------------------------

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
      created_by: adminUser._id,
      operator_id: [1],
    };

    // UUID is omitted as we have no way to predict it
    const expected: Omit<ResultInterfaceV3, "uuid"> = {
      // uuid: "uuid",
      target: ExportTarget.TERRITORY,
      status: ExportStatus.PENDING,
      start_at: new Date(start_at),
      end_at: new Date(end_at),
    };

    await assertHandler(
      kc,
      defaultContext,
      handlerConfigV3,
      params,
      async (response: ResultInterfaceV3) => {
        // assert the response
        const { uuid: _uuid, ...actual } = response;
        assertEquals(actual, expected);

        // assert the database record
        const last = (await fetchExports()).pop();
        assertEquals(last?.target, ExportTarget.TERRITORY);
        assertEquals(last?.status, ExportStatus.PENDING);
        assertEquals(last?.progress, 0);
        assertEquals(last?.params.get().start_at, new Date(params.start_at));
        assertEquals(last?.error, null);
        assertEquals(last?.recipients[0].email, adminUser.email);
      },
    );
  });

  it("should create an export with multiple recipients", async () => {
    const recipients: string[] = [
      faker.internet.email(),
      faker.internet.email(),
      faker.internet.email(),
    ];

    const params: AJVParamsInterface<
      ParamsInterfaceV3,
      "start_at" | "end_at"
    > = {
      tz: "Europe/Paris",
      start_at: "2024-01-01T00:00:00+0100",
      end_at: "2024-01-02T00:00:00+0100",
      created_by: adminUser._id,
      operator_id: [1],
      recipients,
    };

    await assertHandler(
      kc,
      defaultContext,
      handlerConfigV3,
      params,
      async () => {
        const last = (await fetchExports()).pop();
        assertEquals(last?.recipients[0].email, recipients[0]);
        assertEquals(last?.recipients[1].email, recipients[1]);
        assertEquals(last?.recipients[2].email, recipients[2]);
      },
    );
  });

  it("should fallback to created_by on empty recipients", async () => {
    const recipients: string[] = [];

    const params: AJVParamsInterface<
      ParamsInterfaceV3,
      "start_at" | "end_at"
    > = {
      tz: "Europe/Paris",
      start_at: "2024-01-01T00:00:00+0100",
      end_at: "2024-01-02T00:00:00+0100",
      created_by: adminUser._id,
      operator_id: [1],
      recipients,
    };

    await assertHandler(
      kc,
      defaultContext,
      handlerConfigV3,
      params,
      async () => {
        const last = (await fetchExports()).pop();
        assertEquals(last?.recipients[0].email, adminUser.email);
      },
    );
  });

  it("should create a super-admin export (territory)", async () => {
    const params: AJVParamsInterface<
      ParamsInterfaceV3,
      "start_at" | "end_at"
    > = {
      tz: "Europe/Paris",
      start_at: "2024-01-01T00:00:00+0100",
      end_at: "2024-01-02T00:00:00+0100",
      created_by: adminUser._id,
      operator_id: [1],
    };

    await assertHandler(
      kc,
      defaultContext,
      handlerConfigV3,
      params,
      (response: ResultInterfaceV3) => {
        assertEquals(response.target, ExportTarget.TERRITORY);
      },
    );
  });

  it("should create a territory export", async () => {
    const params: AJVParamsInterface<
      ParamsInterfaceV3,
      "start_at" | "end_at"
    > = {
      tz: "Europe/Paris",
      start_at: "2024-01-01T00:00:00+0100",
      end_at: "2024-01-02T00:00:00+0100",
      created_by: adminUser._id,
      operator_id: [1],
    };

    await assertHandler(
      kc,
      set(defaultContext, "call.user.territory_id", 1),
      handlerConfigV3,
      params,
      async (response: ResultInterfaceV3) => {
        // assert response
        assertEquals(response.target, ExportTarget.TERRITORY);

        // assert database record
        const last = (await fetchExports()).pop();
        assertEquals(last?.target, ExportTarget.TERRITORY);

        // TODO
        // assert territory_id has been injected and wrapped in an array ?

        // TODO: resolve the geo_selector from the territory_id
        //       and inject it in the CreateActionV3
        // assertEquals(last?.params.get().geo_selector, { aom: ["TODO"] });
      },
    );
  });

  it("should create an operator export", async () => {
    const params: AJVParamsInterface<
      ParamsInterfaceV3,
      "start_at" | "end_at"
    > = {
      tz: "Europe/Paris",
      start_at: "2024-01-01T00:00:00+0100",
      end_at: "2024-01-02T00:00:00+0100",
      created_by: adminUser._id,
      operator_id: [1],
    };

    await assertHandler(
      kc,
      set(defaultContext, "call.user.operator_id", 2),
      handlerConfigV3,
      params,
      async (response: ResultInterfaceV3) => {
        // assert response
        assertEquals(response.target, ExportTarget.OPERATOR);

        // assert database record
        const last = (await fetchExports()).pop();
        assertEquals(last?.target, ExportTarget.OPERATOR);

        // assert that operator_id has been replaced by the operator's id
        // from the context (2).
        assertEquals(last?.params.get().operator_id, [2]);
      },
    );
  });
});

describe("CreateAction V2", () => {});
