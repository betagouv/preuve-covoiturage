/* eslint-disable no-console */
const aomSeeder = require('./seeds/aom');
const superAdmin = require('./seeds/super-admin');
const dummyAom = require('./seeds/dummy-aom');
const dummyOperator = require('./seeds/dummy-operator');

const config = {
  local: [
    aomSeeder,
    superAdmin,
    dummyAom,
    dummyOperator,
  ],
  dev: [
    aomSeeder,
    superAdmin,
    dummyAom,
    dummyOperator,
  ],
  test: [
    aomSeeder,
    superAdmin,
    dummyAom,
    dummyOperator,
  ],
  production: [
    superAdmin,
  ],
  insee: [
  ],
  default: [
    superAdmin,
  ],
};

module.exports = async function seeder(env) {
  console.log(`Seeding database for '${env}' environment`);

  const seeds = config[env] ? config[env] : config.default;

  return Promise
    .all(seeds.map(async fn => fn()))
    .then(() => {
      if (env !== 'test') {
        console.log('Seeding database complete');
      }
    })
    .catch((err) => {
      console.log('Seeding error');
      console.log(err.message || err);
    });
};
