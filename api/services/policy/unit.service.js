const serviceFactory = require('@pdc/shared/providers/mongo/service-factory');
const IncentiveUnit = require('./entities/models/unit');

module.exports = serviceFactory(IncentiveUnit);
