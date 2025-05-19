import { afterAll, assertEquals, beforeAll, describe, it } from "@/dev_deps.ts";
import { env_or_fail } from "@/lib/env/index.ts";
import sql from "@/lib/pg/sql.ts";
import { DenoMigrator } from "./DenoMigrator.ts";

describe("seed", () => {
  const mig = new DenoMigrator(env_or_fail("APP_POSTGRES_URL"));
  beforeAll(async () => {
    await mig.create();
    await mig.up();
    await mig.migrate({ flash: false, verbose: false });
    await mig.seed();
  });

  afterAll(async () => {
    await mig.drop();
    await mig.down();
  });

  it("should seed territories", async () => {
    const rows = await mig.testConn.query<{ count: string }>(sql`SELECT count(*) FROM geo.perimeters`);
    assertEquals(rows[0].count, "17");
  });
});
