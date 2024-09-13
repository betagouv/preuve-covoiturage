import { buildMigrator } from "@/etl/index.ts";
import { env_or_fail } from "@/lib/env/index.ts";
import { datasets, datastructures } from "./datasets.ts";

export async function migrate(conn: string, schema: string) {
  const migrator = buildMigrator({
    pool: {
      connectionString: conn,
    },
    app: {
      targetSchema: schema,
      datastructures: datastructures,
      datasets: await datasets(),
    },
  });
  try {
    console.debug("[etl] prepare migrator");
    await migrator.prepare();
    console.debug("[etl] run migrator");
    await migrator.run();
    await migrator.pool.end();
    console.debug("[etl] done!");
  } catch (e) {
    await migrator.pool.end();
    throw e;
  }
}
migrate(env_or_fail("APP_POSTGRES_URL"), "observatoire_stats").catch((e) => {
  console.error(e.message);
  console.debug(e.stack);
});
