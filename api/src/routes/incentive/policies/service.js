const serviceFactory = require('../../../packages/mongo/service-factory');
const IncentivePolicy = require('./model');

module.exports = serviceFactory(IncentivePolicy);
