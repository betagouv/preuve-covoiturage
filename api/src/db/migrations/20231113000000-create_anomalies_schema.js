'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['anomaly/000_create_anomaly_schema'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;