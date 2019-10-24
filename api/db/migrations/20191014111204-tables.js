'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(
  [
    'acquisition/001_create_acquisition_table',
    'auth/001_create_auth_table',
    'carpool/001_create_carpool_table',
    'common/001_create_insee_table',
    'common/002_create_role_table',
    'fraudcheck/001_create_fraudcheck_table',
    'operator/001_create_operator_table',
    'operator/002_create_application_table',
    'payment/001_create_payment_table',
    'policy/001_create_policy_table',
    'policy/002_create_incentive_table',
    'policy/003_create_policy_meta_table',
    'territory/001_create_territory_table',
  ],
  __dirname,
);

exports.setup = setup;
exports.up = up;
exports.down = down;
