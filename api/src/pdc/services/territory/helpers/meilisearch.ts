import type { Config } from 'meilisearch';
import { MeiliSearch } from 'meilisearch';

export async function indexData<T>(config: Config, indexName: string, batchSize: number, documents: T[]) {
  try {
    const msg = `Données indexées avec succès dans MeiliSearch`;
    console.time(msg);

    const client = new MeiliSearch(config);

    // Selection de l'index. Un index est créé s'il n'existe pas
    const index = client.index(indexName);

    // On supprime les documents de l'index
    await index.deleteAllDocuments();

    // Indexation des données dans MeiliSearch
    await index.addDocumentsInBatches(documents, batchSize);

    console.timeEnd(msg);
  } catch (e) {
    console.error(`Erreur lors de l\'indexation des données: ${e.message}`);
  }
}
