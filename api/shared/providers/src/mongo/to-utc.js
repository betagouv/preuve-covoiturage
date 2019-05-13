const moment = require('moment');

/**
 * Round minutes to lower quarter (0, 15, 30, 45)
 * Set secondes to 0
 *
 * @param {Date} input
 * @returns {*}
 */
module.exports = (input) => {
  const date = moment.utc(input);
  if (!date) return null;

  return date.toDate();
};
