/* eslint-disable no-console */
const aomSeeder = require('./seeds/aom');
const superAdmin = require('./seeds/super-admin');
const dummyAom = require('./seeds/dummy-aom');
const dummyOperator = require('./seeds/dummy-operator');
const incentiveParameters = require('./seeds/incentive/incentive-parameters');
const incentiveUnits = require('./seeds/incentive/incentive-units');

const config = {
  local: [
    aomSeeder,
    superAdmin,
    dummyAom,
    dummyOperator,
    incentiveParameters,
    incentiveUnits,
  ],
  dev: [
    aomSeeder,
    superAdmin,
    dummyAom,
    dummyOperator,
    incentiveParameters,
    incentiveUnits,
  ],
  test: [
    aomSeeder,
    superAdmin,
    dummyAom,
    dummyOperator,
    incentiveParameters,
    incentiveUnits,
  ],
  production: [
    superAdmin,
    incentiveParameters,
    incentiveUnits,
  ],
  insee: [
  ],
  default: [
    superAdmin,
    incentiveParameters,
    incentiveUnits,
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
