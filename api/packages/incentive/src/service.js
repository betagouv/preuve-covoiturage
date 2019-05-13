const { serviceFactory } = require('@pdc/shared-providers').mongo;
const Incentive = require('./entities/models/incentive');

module.exports = serviceFactory(Incentive);
