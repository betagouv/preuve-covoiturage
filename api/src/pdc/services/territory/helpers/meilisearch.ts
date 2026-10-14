import { getPerformanceTimer } from "@/lib/logger/index.ts";
import { errorCode, taggedLogger } from "@/lib/logger/tagged.ts";
import { type Config, Meilisearch, type RecordAny } from "dep:meilisearch";

const log = taggedLogger("[territory]");

export async function indexData<T extends RecordAny>(
  config: Config,
  indexName: string,
  batchSize: number,
  documents: T[],
) {
  try {
    const timer = getPerformanceTimer();

    const client = new Meilisearch(config);

    // Selection de l'index. Un index est créé s'il n'existe pas
    const index = client.index(indexName);

    // On supprime les documents de l'index
    await index.deleteAllDocuments();

    // Indexation des données dans MeiliSearch
    await Promise.all(index.addDocumentsInBatches(documents, batchSize));

    log.info("indexed", { index: indexName, count: documents.length, ms: timer.stop() });
  } catch (e) {
    log.error("indexing failed", { index: indexName, error: errorCode(e) });
  }
}
