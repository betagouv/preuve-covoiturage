/* eslint-disable no-console */
const Queue = require('@pdc/shared/providers/queue/queue');
const Sentry = require('@pdc/shared/providers/sentry/sentry');

/**
 * Queue to process the journeys
 */
const statsQueue = Queue('stats');
statsQueue.client.on('connect', () => {
  // console.log('🐮/stats: Redis connection OK');
});

statsQueue.client.on('close', () => {
  // console.log('🐮/stats: Redis connection closed');
});

statsQueue.on('error', (err) => {
  console.log('🐮/stats: error', err.message);
  Sentry.captureException(err);
});
statsQueue.on('waiting', (jobId) => {
  console.log(`🐮/stats: waiting ${jobId}`);
});
statsQueue.on('active', (job) => {
  console.log(`🐮/stats: active ${job.id} ${job.data.type}`);
});
statsQueue.on('stalled', (job) => {
  console.log(`🐮/stats: stalled ${job.id} ${job.data.type}`);
});
statsQueue.on('progress', (job, progress) => {
  console.log(`🐮/stats: progress ${job.id} ${job.data.type} : ${progress}`);
});
statsQueue.on('completed', (job) => {
  console.log(`🐮/stats: completed ${job.id} ${job.data.type}`);
  job.remove();
});
statsQueue.on('failed', (job, err) => {
  console.log(`🐮/stats: failed ${job.id} ${job.data.type}`, err.message);
  Sentry.captureException(err);
});

module.exports = statsQueue;
