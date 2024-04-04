import { MeiliSearch } from 'meilisearch';
import type { Config } from 'meilisearch';

export async function indexData<T>(config:Config, indexName:string, batchSize: number, documents:T[]) {
  try {  
    const client = new MeiliSearch(config);
    // Selection de l'index. Un index est créé s'il n'existe pas
    const index = client.index(indexName);
    // On supprime les documents de l'index
    await index.deleteAllDocuments();
    // Indexation des données dans MeiliSearch
    await index.addDocumentsInBatches(documents, batchSize);
    console.log( `Données indexées avec succès dans MeiliSearch`);
  } catch (error) {
    console.log(`Erreur lors de l\'indexation des données: ${error.message}`);
  }
}