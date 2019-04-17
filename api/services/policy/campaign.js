const serviceFactory = require('@pdc/shared/providers/mongo/service-factory');
const IncentiveCampaign = require('./entities/models/campaign');

module.exports = serviceFactory(IncentiveCampaign);
