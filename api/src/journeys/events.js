const EventEmitter = require('events');
const journeyService = require('./journey-service');
const journeyEvents = new EventEmitter();

// Asynchronous event handling
journeyEvents.on('change', async (journey_id) => {
  console.log("journey change")
  setImmediate(async () => {
    await journeyService.validateClass(journey_id);
    await journeyService.validate(journey_id);
  });
});

module.exports = journeyEvents;
