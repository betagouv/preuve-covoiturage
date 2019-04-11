const serviceFactory = require('@pdc/shared/packages/mongo/service-factory');
const IncentiveCampaign = require('./model');

module.exports = serviceFactory(IncentiveCampaign);
