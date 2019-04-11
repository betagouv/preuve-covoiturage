const serviceFactory = require('@pdc/shared/packages/mongo/service-factory');
const IncentiveParameter = require('./model');

module.exports = serviceFactory(IncentiveParameter);
