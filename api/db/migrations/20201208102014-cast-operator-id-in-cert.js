'use strict';

var { createMigration } = require('../helpers/createMigration');
var { setup, up, down } = createMigration(['certificate/20201208102014_cast_operator_id'], __dirname);

exports.setup = setup;
exports.up = up;
exports.down = down;
