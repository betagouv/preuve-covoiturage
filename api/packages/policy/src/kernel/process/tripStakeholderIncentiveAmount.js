const math = require('mathjs');
const mapInternalParams = require('../helpers/mapInternalParams');

export default function tripStakeholderIncentiveAmount({
  policy,
  parameters,
  trip,
  tripStakeholder,
}) {
  const { formula } = policy;

  const tripParameters = mapInternalParams({ policy, trip, tripStakeholder });
  const formulaBasedParameters = policy.parameters.filter(param => param.formula);

  const parser = math.parser();

  // Set policy parameters in parser
  parameters.forEach((param) => {
    parser.set(param.key, param.value);
  });

  // Set trip parameter in parser
  Object.keys(tripParameters).forEach((paramKey) => {
    parser.set(paramKey, tripParameters[paramKey]);
  });

  // Set formula based parameter in parser
  formulaBasedParameters.forEach((parameter) => {
    parser.set(
      parameter.varname,
      parser.eval(parameter.formula),
    );
  });

  const result = parser.eval(formula);
  parser.clear();

  const unitPrecision = policy.unit.precision;
  return math.round(result, unitPrecision);
};
