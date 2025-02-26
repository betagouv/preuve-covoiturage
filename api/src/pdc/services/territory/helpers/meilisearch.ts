import { getPerformanceTimer, logger } from "@/lib/logger/index.ts";
import { MeiliSearch, MeiliSearchConfig } from "dep:meilisearch";

export async function indexData<T>(
  config: MeiliSearchConfig,
  indexName: string,
  batchSize: number,
  documents: T[],
) {
  try {
    const msg = `Données indexées avec succès dans MeiliSearch`;
    const timer = getPerformanceTimer();

    const client = new MeiliSearch(config);

    // Selection de l'index. Un index est créé s'il n'existe pas
    const index = client.index(indexName);

    // On supprime les documents de l'index
    await index.deleteAllDocuments();

    // Indexation des données dans MeiliSearch
    await index.addDocumentsInBatches(documents, batchSize);

    logger.info(`${msg} in ${timer.stop()} ms`);
  } catch (e) {
    logger.error(`Erreur lors de l\'indexation des données: ${e.message}`);
  }
}
