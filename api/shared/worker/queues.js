/* eslint-disable no-console */
const Queue = require('bull');
const config = require('../config');
const Sentry = require('../providers/sentry/sentry');

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
  Sentry.captureException(err);
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
  Sentry.captureException(err);
});

/**
 * Queue to process the emails
 */
const emailsQueue = new Queue(`${process.env.NODE_ENV}-emails`, { redis: config.redisUrl });
emailsQueue.client.on('connect', () => {
  console.log('🐮/emails: Redis connection OK');
});

emailsQueue.client.on('close', () => {
  console.log('🐮/emails: Redis connection closed');
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
  // console.log(JSON.stringify(result));
});
emailsQueue.on('failed', (job, err) => {
  console.log(`🐮/emails: failed ${job.id} ${job.data.type}`, err.message);
  Sentry.captureException(err);
});

module.exports = { journeysQueue, emailsQueue };
