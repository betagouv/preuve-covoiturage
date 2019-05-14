import service = require('./service');
import queue = require('./queue');
import processor = require('./processor');
import config = require('./config');
import bus = require('./transports/bus');
import http = require('./transports/http');
import journey = require('./entities/models/journey');
import safeJourney = require('./entities/models/safe-journey');

export const acquisition = {
  config,
  journeyService: service,
  journeysQueue: queue,
  journeyProcessor: processor,
  transports: { bus, http },
  entities: {
    models: {
      Journey: journey,
      SafeJourney: safeJourney,
    },
  },
};
