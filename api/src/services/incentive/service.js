const serviceFactory = require('../../../packages/mongo/service-factory');
const Incentive = require('./model');

module.exports = serviceFactory(Incentive);
