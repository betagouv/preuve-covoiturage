import { datasets, datastructures } from "@/db/external_data/datasets.ts";
import { buildMigrator } from "@/db/geo/index.ts";
import { env_or_fail } from "@/lib/env/index.ts";

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
    console.debug("[xdata] prepare migrator");
    await migrator.prepare();
    console.debug("[xdata] run migrator");
    await migrator.run();
    await migrator.pool.end();
    console.debug("[xdata] done!");
  } catch (e) {
    await migrator.pool.end();
    throw e;
  }
}
migrate(env_or_fail("APP_POSTGRES_URL"), "observatoire_stats").catch((e) => {
  console.error(e.message);
  console.debug(e.stack);
});
