const faker = require('faker');
const { PhoneNumberFormat } = require('google-libphonenumber');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const insee = require('../insee');

const fakerLat = () => faker.random.number({ min: 43.74717, max: 49.3439, precision: 5 });
const fakerLon = () => faker.random.number({ min: -1.28048, max: 6.23631, precision: 5 });

const phoneNumber = () => {
  let number = phoneUtil.parseAndKeepRawInput(faker.phone.phoneNumber(), 'FR');
  while (!phoneUtil.isValidNumber(number)) {
    number = phoneUtil.parseAndKeepRawInput(faker.phone.phoneNumber(), 'FR');
  }

  return phoneUtil.format(number, PhoneNumberFormat.E164);
};

faker.locale = 'fr';

module.exports = {
  journey_id: faker.random.uuid(),
  operator_journey_id: faker.random.uuid(),
  operator_class: faker.helpers.randomize(['A', 'B', 'C']),
  driver: {
    identity: {
      firstname: faker.name.firstName(),
      lastname: faker.name.lastName(),
      phone: phoneNumber(),
    },
    start: {
      datetime: faker.date.past(),
      lon: fakerLon(),
      lat: fakerLat(),
    },
    end: {
      datetime: faker.date.past(),
      insee: faker.helpers.randomize(insee),
    },
    cost: faker.random.number({ min: 0, max: 5000 }),
    revenue: faker.random.number({ min: 0, max: 4000 }),
    distance: faker.random.number({ min: 0, max: 50000 }),
    duration: faker.random.number({ min: 0, max: 7200 }),
  },
  passenger: {
    identity: {
      phone: phoneNumber(),
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
    contribution: faker.random.number({ min: 0, max: 3000 }),
    distance: faker.random.number({ min: 0, max: 50000 }),
    duration: faker.random.number({ min: 0, max: 7200 }),
    seats: faker.helpers.randomize([1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, null]),
  },
};
