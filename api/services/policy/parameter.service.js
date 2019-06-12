const serviceFactory = require('@pdc/shared/providers/mongo/service-factory');
const IncentiveParameter = require('./entities/models/parameter');

module.exports = serviceFactory(IncentiveParameter);
