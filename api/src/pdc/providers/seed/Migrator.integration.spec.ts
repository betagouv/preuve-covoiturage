import { afterAll, assertEquals, beforeAll, describe, it } from "@/dev_deps.ts";
import { Migrator } from "./Migrator.ts";
import { process } from "@/deps.ts";

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

  it("should seed territories", async (t) => {
    const result = await db.connection.getClient().query({
      text: "SELECT count(*) FROM geo.perimeters",
    });
    assertEquals(result.rows[0].count, "17");
  });
});
