/* eslint-disable global-require */
const mongoose = require("mongoose");
const seeder = require("@pdc/shared/entities/seeder");
const { journeyQueues } = require("@pdc/service-acquisition").acquisition;
const emailsQueues = require("@pdc/shared/worker/queues-emails");

const app = require("@pdc/proxy/app");

const { mongoUrl } = require("@pdc/shared/config");

const queues = { journeyQueues, emailsQueues };

before(async () => {
  await mongoose.disconnect();
  await mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });

  await seeder("test");
});

after(async () => {
  await mongoose.connection.dropDatabase();

  // close Mongo connections
  await mongoose.disconnect();

  // close Redis connections
  await Promise.all(Object.keys(queues).map(async (k) => queues[k].close()));

  // close ExpressJS application server
  await app.close();
});

/**
 * Geo tests
 * - requires DB access
 */
describe("Geo tests", async () => {
  require("@pdc/package-geo/test/geo");
});

/**
 * Functional tests
 */
describe("Functional tests: users", async () => {
  require("./func/hello-world");
  require("./func/users/super-admin");
  require("./func/users/options");
});

describe("Functional tests: journeys", async () => {
  require("./func/journeys/create-server");
  require("./func/journeys/create-server-trips");
});
