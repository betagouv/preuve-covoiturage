const _ = require('lodash');
const fs = require('fs');
const { promisify } = require('util');
const parse = require('csv-parse');
const cast = require('./lib/cast');
const Journey = require('../../routes/journeys/model');

const asyncParse = promisify(parse);

module.exports = async (service, operator, { path }) => {
  const headers = [
    'journey_id',
    'operator_class',
    'passenger.identity.firstname',
    'passenger.identity.lastname',
    'passenger.identity.email',
    'passenger.identity.phone',
    'passenger.identity.company',
    'passenger.identity.over_18',
    'passenger.start.datetime',
    'passenger.start.lat',
    'passenger.start.lon',
    'passenger.start.insee',
    'passenger.start.literal',
    'passenger.end.datetime',
    'passenger.end.lat',
    'passenger.end.lon',
    'passenger.end.insee',
    'passenger.end.literal',
    'passenger.seats',
    'passenger.cost',
    'passenger.distance',
    'passenger.duration',
    'driver.identity.firstname',
    'driver.identity.lastname',
    'driver.identity.email',
    'driver.identity.phone',
    'driver.identity.company',
    'driver.start.datetime',
    'driver.start.lat',
    'driver.start.lon',
    'driver.start.insee',
    'driver.start.literal',
    'driver.end.datetime',
    'driver.end.lat',
    'driver.end.lon',
    'driver.end.insee',
    'driver.end.literal',
    'driver.cost',
    'driver.distance',
    'driver.duration',
  ];

  const lines = await asyncParse(fs.readFileSync(path), { delimiter: ',' });

  const promises = [];
  const failed = [];

  lines.forEach((line) => {
    const j = {};
    for (let i = 0; i < headers.length; i += 1) {
      if (!_.isEmpty(line[i])) {
        let data;

        switch (headers[i]) {
          // case 'passenger.identity.email':
          //   data = `${line[1]}@example.com`;
          //   break;
          // case 'driver.identity.email':
          //   data = `${line[2]}@example.com`;
          //   break;
          // case 'passenger.start.lat':
          // case 'passenger.start.lon':
          // case 'passenger.end.lat':
          // case 'passenger.end.lon':
          // case 'driver.start.lat':
          // case 'driver.start.lon':
          // case 'driver.end.lat':
          // case 'driver.end.lon':
          //   data = undefined;
          //   break;
          default:
            data = cast(headers, line, i);
        }

        if (!_.isNil(data) && !_.isEmpty(data)) {
          _.set(j, headers[i], data);
        }
      }
    }

    const candidate = new Journey(j);
    const err = candidate.validateSync();

    if (err) {
      failed.push({
        journey_id: j.journey_id,
        errors: err.message
          .replace('Journey validation failed: ', '')
          .split(', ').map((item) => {
            const parts = item.split(': ');
            return {
              path: parts[0],
              err: parts[1],
            };
          }),
      });
    } else {
      promises.push(service.create(j, operator));
    }
  });

  const imported = await Promise.all(promises);

  return {
    data: {
      imported,
      failed,
    },
  };
};
