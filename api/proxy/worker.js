/* eslint-disable no-console */
const sendEmail = require('@pdc/package-email/connect');
const journeysQueue = require('@pdc/service-acquisition/queue');
const emailsQueue = require('@pdc/shared/worker/queues-emails');
const statsQueue = require('@pdc/service-stats/queue');
const journeysProcessor = require('@pdc/service-acquisition/processor');
const statsProcessor = require('@pdc/service-stats/processor');
const emailsProcessor = require('@pdc/shared/worker/processor-emails');
const db = require('./mongo');

console.log('Starting 🐮 worker');

// configure processors and pass db connection
journeysQueue.process('*', 1, journeysProcessor(db));
emailsQueue.process('*', 1, emailsProcessor(db, sendEmail));
statsQueue.process('*', 1, statsProcessor(db));
