const serviceFactory = require('@pdc/shared/packages/mongo/service-factory');
const IncentiveParameter = require('./entities/models/parameter');

module.exports = serviceFactory(IncentiveParameter);
