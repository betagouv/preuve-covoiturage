/* eslint-disable no-console */
const Queue = require('bull');
const config = require('../config');
// const Sentry = require('../sentry');

/**
 * Queue to process the journeys
 */
const journeysQueue = new Queue(`${process.env.NODE_ENV}-journeys`, { redis: config.redisUrl });
journeysQueue.client.on('connect', () => {
  console.log('🐮/journeys: Redis connection OK');
});

journeysQueue.client.on('close', () => {
  console.log('🐮/journeys: Redis connection closed');
});

journeysQueue.on('error', (err) => {
  console.log('🐮/journeys: error', err.message);
  // Sentry.captureException(err);
});
journeysQueue.on('waiting', (jobId) => {
  console.log(`🐮/journeys: waiting ${jobId}`);
});
journeysQueue.on('active', (job) => {
  console.log(`🐮/journeys: active ${job.id} ${job.data.type}`);
});
journeysQueue.on('stalled', (job) => {
  console.log(`🐮/journeys: stalled ${job.id} ${job.data.type}`);
});
journeysQueue.on('progress', (job, progress) => {
  console.log(`🐮/journeys: progress ${job.id} ${job.data.type} : ${progress}`);
});
journeysQueue.on('completed', (job) => {
  console.log(`🐮/journeys: completed ${job.id} ${job.data.type}`);
  // console.log(JSON.stringify(result));
});
journeysQueue.on('failed', (job, err) => {
  console.log(`🐮/journeys: failed ${job.id} ${job.data.type}`, err.message);
  // Sentry.captureException(err);
});
