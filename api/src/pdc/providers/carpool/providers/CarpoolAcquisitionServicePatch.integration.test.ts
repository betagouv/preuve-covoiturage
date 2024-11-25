import { afterAll, beforeAll, describe } from "@/dev_deps.ts";
import { ContextType } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { DbContext, makeDbBeforeAfter } from "@/pdc/providers/test/dbMacro.ts";
import { KernelContext, makeKernelBeforeAfter } from "@/pdc/providers/test/helpers.ts";
import { AcquisitionServiceProvider } from "@/pdc/services/acquisition/AcquisitionServiceProvider.ts";

const { before: kernelBefore, after: kernelAfter } = makeKernelBeforeAfter(AcquisitionServiceProvider);
const { before: dbBefore, after: dbAfter } = makeDbBeforeAfter();

function seeder(db: DbContext) {
  return async () => {
    // Insert to carpool_v2.carpools

    // Insert to carpool_v2.requests

    // Insert to carpool_v2.status

    // Insert to carpool_v2.geo
  };
}

describe("CreateAction V3", () => {
  // ---------------------------------------------------------------------------
  // SETUP
  // ---------------------------------------------------------------------------

  let db: DbContext;
  let kc: KernelContext;

  const defaultContext: ContextType = {
    call: { user: { permissions: ["common.acquisition.create"] } },
    channel: { service: "proxy" },
  };

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
  });

  afterAll(async () => {
    await kernelAfter(kc);
    await dbAfter(db);
  });

  // ---------------------------------------------------------------------------
  // TESTS
  // ---------------------------------------------------------------------------
});
