const { serviceFactory } = require('@pdc/shared-providers').mongo;
const IncentiveUnit = require('./entities/models/unit');

export default serviceFactory(IncentiveUnit);
