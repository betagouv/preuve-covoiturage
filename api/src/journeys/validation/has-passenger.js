const _ = require('lodash');

module.exports = async (journey) => {
  return !!_.has(journey.toObject(), 'passengers', []).length;
};
