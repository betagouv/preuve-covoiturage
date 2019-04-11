const inRange = require('./inRange');
const hasRank = require('./hasRank');
const betweenTime = require('./betweenTime');
const isWeekday = require('./isWeekday');

function generateTripStakeholderFilter(policy) {
  const func = [];
  if ('weekday' in policy.rules && policy.rules.weekday !== null) {
    func.push(tripStakeholder => isWeekday({ tripStakeholder, weekday: policy.rules.weekday }));
  }
  if ('time' in policy.rules && policy.rules.time !== null) {
    func.push(tripStakeholder => betweenTime({ tripStakeholder, time: policy.rules.time }));
  }
  if ('range' in policy.rules && policy.rules.range !== null) {
    func.push(tripStakeholder => inRange({ tripStakeholder, range: policy.rules.range }));
  }
  if ('rank' in policy.rules && policy.rules.rank !== null) {
    func.push(tripStakeholder => hasRank({ tripStakeholder, rank: policy.rules.rank }));
  }

  return (tripStakeholder) => {
    let result = true;
    func.forEach((fn) => {
      result = result && fn(tripStakeholder);
    });
    return result;
  };
}

module.exports = function filter({ trip, policy }) {
  if (!policy.rules) {
    return trip;
  }

  const tripStakeholderFilter = generateTripStakeholderFilter(policy);

  const people = trip.people.filter(tripStakeholder => tripStakeholderFilter(tripStakeholder));

  return {
    ...trip,
    people,
  };
};
