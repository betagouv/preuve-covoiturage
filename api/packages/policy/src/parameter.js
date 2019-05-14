const { serviceFactory } = require('@pdc/shared-providers').mongo;
const IncentiveParameter = require('./entities/models/parameter');

export default serviceFactory(IncentiveParameter);
