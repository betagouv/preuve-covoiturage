const { serviceFactory } = require('@pdc/shared-providers').mongo;
const Incentive = require('./entities/models/incentive');

export default serviceFactory(Incentive);
