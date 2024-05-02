'use strict';

/* eslint-disable-next-line */
var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['policy/20240423000000_migrate_to_carpool_v2'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
