import { process } from "@/deps.ts";
import { afterAll, assertEquals, beforeAll, describe, it } from "@/dev_deps.ts";
import { Migrator } from "./Migrator.ts";

describe("seed", () => {
  const db = new Migrator(process.env.APP_POSTGRES_URL);
  beforeAll(async () => {
    await db.create();
    await db.up();
    await db.migrate();
    await db.seed();
  });

  afterAll(async () => {
    await db.drop();
    await db.down();
  });

  it("should seed territories", async () => {
    const result = await db.testConn.getClient().query({
      text: "SELECT count(*) FROM geo.perimeters",
    });
    assertEquals(result.rows[0].count, "17");
  });
});
