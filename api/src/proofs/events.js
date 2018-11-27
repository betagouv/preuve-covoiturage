const EventEmitter = require('events');
const proofEvents = new EventEmitter();
const proofService = require('./proof-service');


// Asynchronous event handling
proofEvents.on('change', async (service, proof) => {
  setImmediate(async () => {
    await service.processProof(proof);
  });
});

module.exports = proofEvents;
