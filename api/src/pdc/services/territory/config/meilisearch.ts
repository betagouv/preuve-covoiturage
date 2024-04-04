export const config = {
  host: process.env.APP_MEILISEARCH_HOST || 'http://localhost',
  apiKey: process.env.APP_MEILISEARCH_APIKEY || '',
  index: process.env.APP_MEILISEARCH_INDEX || 'geo',
  batchSize: Number(process.env.APP_MEILISEARCH_BATCH) || 1000,
}