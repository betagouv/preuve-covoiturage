const { modelFactory } = require('@pdc/shared-providers').mongo;
const IncentiveCampaignSchema = require('../schemas/campaign');

module.exports = modelFactory('IncentiveCampaign', {
  schema: IncentiveCampaignSchema,
});
