const internalParams = require('../../entities/seeds/incentive-parameters');

function mapInternalParam(param, { policy, trip, tripStakeholder }) {
  return param.getter(tripStakeholder, { policy, trip });
}

export default function mapInternalParams({ policy, trip, tripStakeholder }) {
  return internalParams.filter(param => param.internal)
    .map(param => ({
      varname: param.varname,
      value: mapInternalParam(param, { policy, trip, tripStakeholder }),
    }))
    .reduce((parameters, param) => {
      const accumulator = { ...parameters };
      accumulator[param.varname] = param.value;
      return accumulator;
    }, {});
};
