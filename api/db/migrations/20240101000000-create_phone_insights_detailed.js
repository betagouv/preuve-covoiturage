'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['fraudcheck/20240101000000_create_phone_insights_detailed'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;