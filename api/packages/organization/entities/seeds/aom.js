/* eslint-disable no-console */
const _ = require('lodash');
const Aom = require('../models/aom');
const source = require('../seeds/aom.json');

module.exports = async () => {
  const existing = await Aom.find({}, { network_id: 1 }).exec();
  const filtered = [];
  existing.forEach((item) => {
    filtered.push(item.toObject().network_id);
  });
  const ordered = _.uniq(_.sortBy(filtered));

  const toAdd = [];
  source.forEach(async (aom) => {
    if (ordered.indexOf(aom.network_id) > -1) return;
    toAdd.push(_.assign({
      geometry: {
        type: 'MultiPolygon',
        coordinates: [[[[0, 0], [0, 1], [1, 1], [0, 0]]]],
      },
    }, _.omit(aom, ['_id'])));
  });

  await Aom.create(toAdd);

  if (process.env.NODE_ENV !== 'test') {
    console.log('- 💾 List of AOM seeded');
  }
};
