const serviceFactory = require('@pdc/shared/packages/mongo/service-factory');
const Incentive = require('./entities/models/incentive');

module.exports = serviceFactory(Incentive);
