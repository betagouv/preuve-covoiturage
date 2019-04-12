const EventEmitter = require('events');

const eventBus = new EventEmitter();

/**
 * Register the events declared in {route}/events.js
 * and declared in app.js : eventBus.register('route', eventsObject);
 *
 * @param route
 * @param events
 */
const register = (route, events = {}) => {
  Object.keys(events).forEach((key) => {
    eventBus.on(`${route}.${key}`, events[key]);
  });
};

module.exports = eventBus;
module.exports.register = register;
