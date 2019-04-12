const serviceFactory = require('@pdc/shared/packages/mongo/service-factory');
const IncentiveCampaign = require('./entities/models/campaign');

module.exports = serviceFactory(IncentiveCampaign);
