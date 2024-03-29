import { MeiliSearch } from 'meilisearch';
import type { Config } from 'meilisearch';

export async function indexData<T>(config:Config, indexName:string, documents:T[]) {
  try {  
    const client = new MeiliSearch(config);
    // Selection de l'index. Un index est créé s'il n'existe pas
    const index = client.index(indexName);
    // On supprime les documents de l'index
    await index.deleteAllDocuments();
    // Indexation des données dans MeiliSearch
    const response = await index.addDocuments(documents);
    return `Données indexées avec succès dans MeiliSearch : ${response}`;
  } catch (error) {
    throw `Erreur lors de la récupération ou de l\'indexation des données: ${error}`;
  }
}