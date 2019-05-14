import service = require('./service');
import http = require('./transports/http');

export const incentive = {
  incentiveService: service,
  transports: {
    http,
  },
};
