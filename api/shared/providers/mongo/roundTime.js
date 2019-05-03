const moment = require('moment');

/**
 * Round minutes to lower quarter (0, 15, 30, 45)
 * Set secondes to 0
 */
module.exports = (input) => {
  const date = moment.utc(input);
  if (!date) return null;

  const minutes = date.minutes() > 52 ? date.minutes() : date.minutes() + 7.5;

  // eslint-disable-next-line no-bitwise
  date.minutes(((minutes / 15 | 0) * 15) % 60);
  date.seconds(0);

  return date.toDate();
};
