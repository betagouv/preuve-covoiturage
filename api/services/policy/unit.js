const serviceFactory = require('@pdc/shared/packages/mongo/service-factory');
const IncentiveUnit = require('./model');

module.exports = serviceFactory(IncentiveUnit);
