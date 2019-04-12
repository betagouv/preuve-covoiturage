const serviceFactory = require('@pdc/shared/packages/mongo/service-factory');
const IncentiveUnit = require('./entities/models/unit');

module.exports = serviceFactory(IncentiveUnit);
