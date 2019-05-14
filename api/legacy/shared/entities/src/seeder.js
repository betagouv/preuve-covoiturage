/* eslint-disable no-console */
const { aom } = require('@pdc/service-organization').entities.seeds;
const { superAdmin } = require('@pdc/service-user').user.entities.seeds;
const { dummyAom } = require('@pdc/service-organization').entities.seeds;
const { dummyOperator } = require('@pdc/service-organization').entities.seeds;

const config = {
  local: [
    aom,
    superAdmin,
    dummyAom,
    dummyOperator,
  ],
  dev: [
    aom,
    superAdmin,
    dummyAom,
    dummyOperator,
  ],
  review: [
    aom,
    superAdmin,
    dummyAom,
    dummyOperator,
  ],
  test: [
    aom,
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

export default async function seeder(env) {
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
