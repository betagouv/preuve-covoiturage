const _ = require('lodash');
const serviceFactory = require('@pdc/shared/packages/mongo/service-factory');
const IncentivePolicy = require('./entities/models/policy');
const baseParametersOriginal = require('./entities/seeds/incentive-parameters');
const baseUnits = require('./entities/seeds/incentive-units');

const baseParameters = _.map(baseParametersOriginal, param => _.omit(param, ['getter']));

module.exports = serviceFactory(IncentivePolicy, {

  /**
   * map parameters form policies
   *
   * @param filter
   * @returns {Promise<Array>}
   */
  async findParameters(filter = {}) {
    let parameters = [];
    const policies = await IncentivePolicy.find(filter)
      .select({ parameters: 1, _id: 0 })
      .exec();
    if (policies.length > 0) {
      parameters = policies.map(policy => policy.parameters).reduce((pre, cur) => pre.concat(cur));
    }
    parameters = _.uniqBy(parameters, 'varname');
    parameters = _.unionBy(parameters, baseParameters, 'varname');
    return parameters;
  },

  /**
   * map units from policies
   *
   * @param filter
   * @returns {Promise<Array>}
   */
  async findUnits(filter = {}) {
    let units = [];

    const policies = await IncentivePolicy.find(filter)
      .select({ unit: 1, _id: 0 })
      .exec();

    if (policies.length > 0) {
      units = policies.map(policy => policy.unit);
    }
    units = _.uniqBy(units, 'short_name');
    units = _.unionBy(units, baseUnits, 'short_name');
    return units;
  },


  async fillPoliciesParametered(policiesParametered) {
    const policies = await Promise.all(policiesParametered.map(async policyParametered => ({
      policy: await IncentivePolicy.findOne({ _id: policyParametered.policy }).exec(),
      parameters: policyParametered.parameters,
    })));

    return policies;
  },

});
