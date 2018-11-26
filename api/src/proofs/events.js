const EventEmitter = require('events');

const proofEvents = new EventEmitter();

// Asynchronous event handling
proofEvents.on('change', async (service, proof) => {
  setImmediate(async () => {
    await service.enrich(proof);
    await service.validate(proof);
  });
});

module.exports = proofEvents;
