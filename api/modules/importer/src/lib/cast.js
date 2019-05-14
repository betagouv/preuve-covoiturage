/* eslint-disable no-param-reassign */
const moment = require('moment');

/**
 * @param {Array} headers
 * @param {Array} line
 * @param {number} i
 */
export default (headers, line, i) => {
  let data = {};

  const frRegex = /^([0-9]{2})[^0-9]+([0-9]{2})[^0-9]+([0-9]{4})[^0-9]+([0-9]{2})[^0-9]+([0-9]{2})[^0-9]?([0-9]{2})?$/;

  switch (headers[i]) {
    case 'passenger.start.datetime':
    case 'passenger.end.datetime':
    case 'driver.start.datetime':
    case 'driver.end.datetime':
      // convert French format dd/mm/yyyy hh:mm(:ss)
      if (frRegex.test(line[i])) {
        line[i] = line[i].replace(frRegex, '$3-$2-$1 $4:$5:$6');
        if (line[i].substr(-1) === ':') {
          line[i] = `${line[i]}00`;
        }
      }

      data = moment.utc(line[i]).toISOString();
      break;

    case 'passenger.identity.over_18':
      data = line[i].toLowerCase() === 'true'
        || line[i].toLowerCase() === 'vrai'
        || line[i].toLowerCase() === 'on'
        || line[i].toLowerCase() === '1';
      break;

    case 'passenger.start.lat':
    case 'passenger.start.lon':
    case 'passenger.end.lat':
    case 'passenger.end.lon':
    case 'driver.start.lat':
    case 'driver.start.lon':
    case 'driver.end.lat':
    case 'driver.end.lon':
      data = parseFloat(line[i]);
      break;

    case 'passenger.seats':
    case 'passenger.cost':
    case 'passenger.distance':
    case 'passenger.duration':
    case 'driver.cost':
    case 'driver.distance':
    case 'driver.duration':
      data = parseInt(line[i], 10);
      break;

    default:
      data = line[i];
  }

  return data;
};
