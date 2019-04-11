/* eslint-disable no-console */
const _ = require('lodash');
const source = require('./incentive-units.json');
const IncentiveUnit = require('../../../routes/incentive/units/model');

module.exports = async function incentiveUnit() {
  const existing = await IncentiveUnit.find({}, 'short_name').exec();
  const filtered = [];
  existing.forEach((item) => {
    filtered.push(item.toObject().short_name);
  });
  const ordered = _.uniq(_.sortBy(filtered));

  const toAdd = [];
  source.forEach(async (unit) => {
    if (ordered.indexOf(unit.short_name) > -1) return;
    toAdd.push(unit);
  });

  await IncentiveUnit.create(toAdd);

  if (process.env.NODE_ENV !== 'test') {
    console.log('- 💾 List of incentive units added');
  }
};
