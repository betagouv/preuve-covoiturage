/* eslint-disable global-require */
const mongoose = require('mongoose');
const seeder = require('../src/database/seeder');
const queues = require('../src/worker/queues');
const app = require('../src/app');

const { mongoUrl } = require('../src/config.js');

before(async () => {
  await mongoose.disconnect();
  await mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });

  await seeder('test');
});

after(async () => {
  await mongoose.connection.dropDatabase();

  // close Mongo connections
  await mongoose.disconnect();

  // close Redis connections
  await Promise.all(Object.keys(queues).map(async k => queues[k].close()));

  // close ExpressJS application server
  await app.close();
});

/**
 * Unit tests
 */
describe('Unit tests: geo', async () => {
  require('./unit/geo/aom');
  require('./unit/geo/postcodes');
  // require('./unit/geo/town');
});

describe('Unit tests: validation', async () => {
  require('./unit/validation/regex');
  require('./unit/validation/validators');
});

describe('Unit tests: datetime', async () => {
  require('./unit/datetime/round');
});

/**
 * Functional tests
 */
describe('Functional tests: users', async () => {
  require('./func/hello-world');
  require('./func/users/super-admin');
  require('./func/users/options');
});

describe('Functional tests: journeys', async () => {
  require('./func/journeys/create-server');
  require('./func/journeys/create-server-trips');
});
