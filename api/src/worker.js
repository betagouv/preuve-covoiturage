/* eslint-disable no-console */
const db = require('./mongo');
const sendEmail = require('./packages/emails/connect');
const { journeysQueue, emailsQueue } = require('./worker/queues');
const journeysProcessor = require('./worker/processor-journeys');
const emailsProcessor = require('./worker/processor-emails');

console.log('Starting 🐮 worker');

// configure processors and pass db connection
journeysQueue.process('*', 1, journeysProcessor(db));
emailsQueue.process('*', 1, emailsProcessor(db, sendEmail));
