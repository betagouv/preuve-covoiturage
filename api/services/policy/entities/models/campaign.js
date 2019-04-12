const modelFactory = require('@pdc/shared/packages/mongo/model-factory');
const IncentiveCampaignSchema = require('../schemas/campaign');

module.exports = modelFactory('IncentiveCampaign', {
  schema: IncentiveCampaignSchema,
});
