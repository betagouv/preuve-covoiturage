'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(
  [
    'acquisition/000_create_acquisition_schema',
    'application/000_create_application_schema',
    'application/000_create_application_extension',
    'auth/000_create_auth_schema',
    'carpool/000_create_carpool_schema',
    'common/000_create_common_schema',
    'fraudcheck/000_create_fraudcheck_schema',
    'operator/000_create_operator_schema',
    'payment/000_create_payment_schema',
    'policy/000_create_policy_schema',
    'territory/000_create_territory_schema',
  ],
  __dirname,
);

exports.setup = setup;
exports.up = up;
exports.down = down;
