const modelFactory = require('@pdc/shared/providers/mongo/model-factory');
const IncentiveCampaignSchema = require('../schemas/campaign');

module.exports = modelFactory('IncentiveCampaign', {
  schema: IncentiveCampaignSchema,
});
