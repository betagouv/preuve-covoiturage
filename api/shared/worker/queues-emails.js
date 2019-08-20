/* eslint-disable no-console */
const Queue = require('../providers/queue/queue');
const Sentry = require('../providers/sentry/sentry');

/**
 * Queue to process the emails
 */
const emailsQueue = Queue('emails');
emailsQueue.client.on('connect', () => {
  // console.log('🐮/emails: Redis connection OK');
});

emailsQueue.client.on('close', () => {
  // console.log('🐮/emails: Redis connection closed');
});

emailsQueue.on('error', (err) => {
  console.log('🐮/emails: error', err.message);
  Sentry.captureException(err);
});
emailsQueue.on('waiting', (jobId) => {
  console.log(`🐮/emails: waiting ${jobId}`);
});
emailsQueue.on('active', (job) => {
  console.log(`🐮/emails: active ${job.id} ${job.data.type}`);
});
emailsQueue.on('stalled', (job) => {
  console.log(`🐮/emails: stalled ${job.id} ${job.data.type}`);
});
emailsQueue.on('progress', (job, progress) => {
  console.log(`🐮/emails: progress ${job.id} ${job.data.type} : ${progress}`);
});
emailsQueue.on('completed', (job) => {
  console.log(`🐮/emails: completed ${job.id} ${job.data.type}`);
  if (process.env.NODE_ENV !== 'local') {
    job.remove();
  }
});
emailsQueue.on('failed', (job, err) => {
  console.log(`🐮/emails: failed ${job.id} ${job.data.type}`, err.message);
  Sentry.captureException(err);
});

module.exports = emailsQueue;
