'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(
  [
    'anomaly/20240118000000_update_anomaly_table_constraints',
  ],
  __dirname,
);

exports.setup = setup;
exports.up = up;
exports.down = down;