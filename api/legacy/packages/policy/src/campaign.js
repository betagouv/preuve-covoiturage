const { serviceFactory } = require('@pdc/shared-providers').mongo;
const IncentiveCampaign = require('./entities/models/campaign');

export default serviceFactory(IncentiveCampaign);
