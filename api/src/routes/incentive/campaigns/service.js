const serviceFactory = require('../../../packages/mongo/service-factory');
const IncentiveCampaign = require('./model');

module.exports = serviceFactory(IncentiveCampaign);
