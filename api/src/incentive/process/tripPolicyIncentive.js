const _ = require('lodash');

const tripStakeholderIncentiveAmount = require('./tripStakeholderIncentiveAmount');

module.exports = function tripPolicyIncentive(
  {
    campaign,
    policy,
    parameters,
    trip,
  },
  callback = undefined,
) {
  function generateIncentive({ tripStakeholder, amount }) {
    return {
      operator: _.get(trip, 'operator_id'),
      campaign: _.get(campaign, '_id'),
      target: _.get(tripStakeholder, 'identity'),
      trip: _.get(trip, '_id'),
      unit: policy.unit,
      amount,
      status: 'pending',
    };
  }

  const incentives = [];

  trip.people.forEach((tripStakeholder) => {
    const amount = tripStakeholderIncentiveAmount({ policy, parameters, trip, tripStakeholder });
    const incentive = generateIncentive({ tripStakeholder, amount });

    if (callback && typeof callback === 'function') {
      callback(incentive);
    }

    incentives.push(incentive);
  });

  return incentives;
};
