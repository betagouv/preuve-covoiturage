/* eslint-disable no-console */
const sendEmail = require('@pdc/package-email/connect');
const journeysQueue = require('@pdc/service-acquisition/queue');
const emailsQueue = require('@pdc/shared/worker/queues-emails');
const journeysProcessor = require('@pdc/service-acquisition/processor');
const emailsProcessor = require('@pdc/shared/worker/processor-emails');
const db = require('./mongo');

console.log('Starting 🐮 worker');

// configure processors and pass db connection
journeysQueue.process('*', 1, journeysProcessor(db));
emailsQueue.process('*', 1, emailsProcessor(db, sendEmail));
