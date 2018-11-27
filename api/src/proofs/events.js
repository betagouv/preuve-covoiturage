const EventEmitter = require('events');

const proofEvents = new EventEmitter();
const proofService = require('./proof-service');
const journeyService = require('../journeys/journey-service');

// Asynchronous event handling
proofEvents.on('change', async (proof) => {
  setImmediate(async () => {
    await proofService.enrich(proof);
    await proofService.validate(proof);
    journeyService.create(proof);
  });

});

module.exports = proofEvents;
