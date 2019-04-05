/* eslint-disable no-console */
const _ = require('lodash');
const source = require('./incentive-parameters.json');
const IncentiveParameter = require('../../../routes/incentive/parameters/model');

module.exports = async function incentiveParameter() {
  const existing = await IncentiveParameter.find({}, 'varname').exec();
  const filtered = [];
  existing.forEach((item) => {
    filtered.push(item.toObject().varname);
  });
  const ordered = _.uniq(_.sortBy(filtered));

  const toAdd = [];
  source.forEach(async (parameter) => {
    if (ordered.indexOf(parameter.varname) > -1) return;
    toAdd.push(parameter);
  });

  await IncentiveParameter.create(toAdd);

  if (process.env.NODE_ENV !== 'test') {
    console.log('- 💾 List of incentive parameters seeded');
  }
};
