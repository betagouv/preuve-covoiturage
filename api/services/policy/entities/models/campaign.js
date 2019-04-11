const modelFactory = require('@pdc/shared/packages/mongo/model-factory');
const IncentiveCampaignSchema = require('../../../database/schemas/incentive-campaign');

module.exports = modelFactory('IncentiveCampaign', {
  schema: IncentiveCampaignSchema,
});
