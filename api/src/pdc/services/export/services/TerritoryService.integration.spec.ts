import { afterAll, beforeAll, describe } from "@/dev_deps.ts";
import { LegacyPostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { DbContext, KernelContext, makeDbBeforeAfter, makeKernelBeforeAfter } from "@/pdc/providers/test/index.ts";
import { ExportServiceProvider as ExportSP } from "@/pdc/services/export/ExportServiceProvider.ts";
import { TerritoryRepository } from "@/pdc/services/export/repositories/TerritoryRepository.ts";
import { UserServiceProvider as UserSP } from "@/pdc/services/user/UserServiceProvider.ts";
import { TerritoryService } from "./TerritoryService.ts";

const { before: kernelBefore, after: kernelAfter } = makeKernelBeforeAfter(
  UserSP,
  ExportSP,
);
const { before: dbBefore, after: dbAfter } = makeDbBeforeAfter();

describe("territory service", () => {
  // ---------------------------------------------------------------------------
  // SETUP
  // ---------------------------------------------------------------------------

  let db: DbContext;
  let kc: KernelContext;
  let repository: TerritoryRepository;
  let service: TerritoryService;

  /**
   * - boot up postgresql connection
   * - create the kernel
   * - stop the existing kernel connection to replace it with the test one
   * - setup the db macro with the connection
   */
  beforeAll(async () => {
    db = await dbBefore();
    kc = await kernelBefore();
    await kc.kernel.getContainer().get(LegacyPostgresConnection).down();
    kc.kernel
      .getContainer()
      .rebind(LegacyPostgresConnection)
      .toConstantValue(db.connection);

    repository = new TerritoryRepository(db.connection);
    service = new TerritoryService(repository);
  });

  afterAll(async () => {
    await kernelAfter(kc);
    await dbAfter(db);
  });

  // ---------------------------------------------------------------------------
  // TESTS : resolve
  // ---------------------------------------------------------------------------

  // TODO
});
