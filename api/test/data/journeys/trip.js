const _ = require('lodash');
const faker = require('faker');
const insee = require('../insee');

// const fakerLat = () => faker.random.number({ min: 43.74717, max: 49.3439, precision: 5 });
// const fakerLon = () => faker.random.number({ min: -1.28048, max: 6.23631, precision: 5 });

faker.locale = 'fr';

const tripGenerator = (name, override = null) => {
  const data = {
    journey_id: faker.random.uuid(),
    operator_journey_id: name,
    operator_class: faker.helpers.randomize(['A', 'B', 'C']),
    driver: {
      identity: {
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        phone: faker.phone.phoneNumber(),
      },
      start: {
        datetime: faker.date.past(),
        insee: faker.helpers.randomize(insee),
      },
      end: {
        datetime: faker.date.past(),
        insee: faker.helpers.randomize(insee),
      },
      cost: faker.random.number({ min: 0, max: 20, precision: 2 }),
      distance: faker.random.number({ min: 0, max: 50000 }),
      duration: faker.random.number({ min: 0, max: 7200 }),
    },
    passenger: {
      identity: {
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        phone: faker.phone.phoneNumber(),
        over_18: faker.helpers.randomize([true, false, null]),
      },
      start: {
        datetime: faker.date.past(),
        insee: faker.helpers.randomize(insee),
      },
      end: {
        datetime: faker.date.past(),
        insee: faker.helpers.randomize(insee),
      },
      cost: faker.random.number({ min: 0, max: 20, precision: 2 }),
      distance: faker.random.number({ min: 0, max: 50000 }),
      duration: faker.random.number({ min: 0, max: 7200 }),
      seats: faker.helpers.randomize([1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, null]),
    },
  };

  if (override) {
    return _.assign(data, override);
  }

  return data;
};

module.exports = tripGenerator;
