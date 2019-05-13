/* eslint-disable no-console */
const { sendEmail } = require('@pdc/package-email');
const { processorEmails: emailsProcessor, queuesEmails: emailsQueue } = require('@pdc/shared-worker');
const { journeysQueue } = require('@pdc/service-acquisition').acquisition;
const { journeysProcessor } = require('@pdc/service-acquisition').acquisition;
const db = require('./mongo');

console.log('Starting 🐮 worker');

// configure processors and pass db connection
journeysQueue.process('*', 1, journeysProcessor(db));
emailsQueue.process('*', 1, emailsProcessor(db, sendEmail));
