'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(
  [
    'observatory/007_update_insert_monthly_flux_procedure',
    'observatory/008_update_insert_monthly_occupation_procedure',
    'observatory/009_update_insert_monthly_distribution_procedure',
  ],
  __dirname,
);

exports.setup = setup;
exports.up = up;
exports.down = down;