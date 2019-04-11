const tripPolicyIncentive = require('./tripPolicyIncentive');
const filter = require('../filters/filter');

module.exports = function tripCampaign({ campaign, trip }, callback) {
  let incentives = [];

  campaign.policies.forEach(({ policy, parameters }) => {
    const filteredTrip = filter({ trip, policy });
    if (filteredTrip.people.length > 0) {
      incentives = [
        ...incentives,
        ...tripPolicyIncentive({ campaign, policy, parameters, trip: filteredTrip }, callback),
      ];
    }
  });

  return incentives;
};
