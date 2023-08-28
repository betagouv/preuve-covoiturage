import { buildMigrator } from '@betagouvpdc/evolution-geo';
import { datastructures, datasets } from './datasets';


async function main(): Promise<void> {
  const etlDatasets =  await datasets();
  const migrator = buildMigrator({
    app: { 
      targetSchema: 'observatory',
      datastructures: datastructures,
      datasets: etlDatasets
    },
  });
  await migrator.prepare();
  await migrator.run();
  await migrator.pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});