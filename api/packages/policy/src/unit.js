const { serviceFactory } = require('@pdc/shared-providers').mongo;
const IncentiveUnit = require('./entities/models/unit');

module.exports = serviceFactory(IncentiveUnit);
