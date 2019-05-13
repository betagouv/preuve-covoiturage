const { serviceFactory } = require('@pdc/shared-providers').mongo;
const IncentiveParameter = require('./entities/models/parameter');

module.exports = serviceFactory(IncentiveParameter);
