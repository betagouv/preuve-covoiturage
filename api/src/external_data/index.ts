import { buildMigrator } from "@/etl/index.ts";
import { datasets, datastructures } from "./datasets.ts";

(async function main(): Promise<void> {
  const migrator = buildMigrator({
    app: {
      targetSchema: "observatoire_stats",
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
})().catch((e) => {
  console.error(e.message);
  console.debug(e.stack);
});
