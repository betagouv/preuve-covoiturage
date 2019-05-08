const serviceFactory = require('@pdc/shared/providers/mongo/service-factory');
const Incentive = require('./entities/models/incentive');

module.exports = serviceFactory(Incentive);
