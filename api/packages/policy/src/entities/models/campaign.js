const { modelFactory } = require('@pdc/shared-providers').mongo;
const IncentiveCampaignSchema = require('../schemas/campaign');

export default modelFactory('IncentiveCampaign', {
  schema: IncentiveCampaignSchema,
});
